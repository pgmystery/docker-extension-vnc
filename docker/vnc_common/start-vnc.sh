#!/bin/bash
set -euo pipefail

# --- helpers ---------------------------------------------------------------

log() { echo "[$(date +'%H:%M:%S')] $*"; }

cleanup() {
  set +e
  log "🧹 Cleaning up..."

  # Stop child loops (ffmpeg supervisors) if still running
  [[ -n "${AUDIO_OUT_LOOP_PID:-}" ]] && kill "${AUDIO_OUT_LOOP_PID}" 2>/dev/null || true
  [[ -n "${MIC_LOOP_PID:-}" ]] && kill "${MIC_LOOP_PID}" 2>/dev/null || true

  # Stop VNC
  tigervncserver -kill :0 2>/dev/null || true
  rm -f /tmp/.X0-lock /tmp/.X11-unix/X0 2>/dev/null || true

  # PulseAudio cleanup
  if command -v pactl >/dev/null 2>&1; then
    if pactl info >/dev/null 2>&1; then
      [[ -n "${PA_MOD_VIRTUAL_SINK_ID:-}" ]] && pactl unload-module "${PA_MOD_VIRTUAL_SINK_ID}" >/dev/null 2>&1 || true
      [[ -n "${PA_MOD_MIC_SINK_ID:-}"     ]] && pactl unload-module "${PA_MOD_MIC_SINK_ID}"     >/dev/null 2>&1 || true
      [[ -n "${PA_MOD_REMAP_SRC_ID:-}"    ]] && pactl unload-module "${PA_MOD_REMAP_SRC_ID}"    >/dev/null 2>&1 || true
    fi
  fi

  pulseaudio --check >/dev/null 2>&1 && pulseaudio -k >/dev/null 2>&1 || true
  rm -rf "${XDG_RUNTIME_DIR:-/tmp/runtime}/pulse" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

wait_for_pa() {
  local sock="$1"
  log "Waiting for PulseAudio socket: $sock"
  local i=0
  until [[ -S "$sock" ]]; do
    i=$((i + 1))
    if [[ $i -gt 60 ]]; then
      log "❌ PulseAudio socket did not appear in time."
      return 1
    fi
    sleep 0.25
  done
  log "✅ PulseAudio socket is ready."
}

wait_for_sink() {
  local sink="$1"
  local i=0
  until pactl list short sinks 2>/dev/null | awk '{print $2}' | grep -qx "$sink"; do
    i=$((i + 1))
    if [[ $i -gt 60 ]]; then
      log "❌ PulseAudio sink '$sink' did not appear in time."
      return 1
    fi
    sleep 0.25
  done
}

# --- loops ----------------------------------------------------------------

start_audio_output_loop() {
  set +e
  log "🚀 Starting FFmpeg supervisor (audio output)..."
  while true; do
    log "▶️ Starting FFmpeg (audio output)..."
    ffmpeg -loglevel error -nostdin \
      -f pulse -i "virtual_sink.monitor" \
      -c:a libopus -b:a 96k -vbr off -compression_level 5 \
      -frame_duration 10 -application lowdelay \
      -f mpegts -pes_payload_size 0 -flush_packets 1 \
      "srt://0.0.0.0:7900?mode=listener&latency=0"
    EXIT_CODE=$?
    log "⚠️ FFmpeg (audio output) exited with code $EXIT_CODE. Restarting in 1 second..."
    sleep 1
  done
}

start_mic_loop() {
  set +e

  # This tells the underlying SRT library to only speak if there is a fatal error
  export SRT_LOG_LEVEL=error

  log "🎤 Starting FFmpeg supervisor (virtual mic input)..."
  while true; do
    # 1. Check if the proxy is even there
    if ! ffmpeg -v quiet -t 1 -i "srt://vnc-viewer-proxy:8890?streamid=read:mic" -f null - 2>/dev/null; then
      sleep 2
      continue
    fi

    ffmpeg -loglevel error -nostdin -v quiet \
      -i "srt://vnc-viewer-proxy:8890?streamid=read:mic&latency=0" \
      -c:a pcm_s16le -ar 48000 -ac 2 \
      -f pulse "mic_sink"

    sleep 2
  done
}

# --- 1) environment -------------------------------------------------------

export HOME="${HOME:-/home/vncuser}"
export XDG_RUNTIME_DIR="${XDG_RUNTIME_DIR:-/tmp/runtime}"
mkdir -p "$XDG_RUNTIME_DIR"
chmod 700 "$XDG_RUNTIME_DIR" || true # Might fail if not owner, ignore

export PULSE_RUNTIME_PATH="$XDG_RUNTIME_DIR/pulse"
export PULSE_SERVER="unix:$PULSE_RUNTIME_PATH/native"

# Pulse configuration
mkdir -p "$HOME/.config/pulse"
cat > "$HOME/.config/pulse/daemon.conf" <<'EOF'
daemonize = yes
system-instance = no
allow-exit = no
exit-idle-time = -1
enable-shm = no
realtime-scheduling = no
EOF

cat > "$HOME/.config/pulse/client.conf" <<EOF
autospawn = no
default-server = ${PULSE_SERVER}
EOF

rm -rf "$PULSE_RUNTIME_PATH" 2>/dev/null || true
mkdir -p "$PULSE_RUNTIME_PATH"
chmod 700 "$PULSE_RUNTIME_PATH"

# --- 2) start PulseAudio --------------------------------------------------

if pulseaudio --check >/dev/null 2>&1; then
  log "PulseAudio already running; stopping it first..."
  pulseaudio -k || true
  sleep 0.2
fi

if command -v pulseaudio >/dev/null 2>&1; then
  log "🔊 Starting PulseAudio..."
  pulseaudio --daemonize=yes --log-target=stderr --realtime=no
  wait_for_pa "$PULSE_RUNTIME_PATH/native"
else
  log "ℹ️ PulseAudio not found, skipping audio initialization."
fi

# --- 3) create virtual devices -------------------------------------------

if command -v pactl >/dev/null 2>&1; then
  if ! pactl list short sinks 2>/dev/null | awk '{print $2}' | grep -qx "virtual_sink"; then
    PA_MOD_VIRTUAL_SINK_ID="$(pactl load-module module-null-sink sink_name=virtual_sink sink_properties=device.description=Virtual_Sink)"
  fi
  pactl set-default-sink virtual_sink
  wait_for_sink "virtual_sink"

  if [[ "${VNC_EXTENSION_AUDIO_INPUT:-true}" == "true" ]]; then
    if ! pactl list short sinks 2>/dev/null | awk '{print $2}' | grep -qx "mic_sink"; then
      PA_MOD_MIC_SINK_ID="$(pactl load-module module-null-sink sink_name=mic_sink sink_properties=device.description=Virtual_Mic_Input)"
    fi

    if ! pactl list short sources 2>/dev/null | awk '{print $2}' | grep -qx "virtmic"; then
      PA_MOD_REMAP_SRC_ID="$(pactl load-module module-remap-source master=mic_sink.monitor source_name=virtmic source_properties=device.description=Virtual_Microphone)"
    fi

    pactl set-default-source virtmic
  fi
fi

# --- 4) start streaming loops --------------------------------------------

if command -v ffmpeg >/dev/null 2>&1; then
  if [[ "${VNC_EXTENSION_AUDIO_OUTPUT:-true}" == "true" ]]; then
    start_audio_output_loop &
    AUDIO_OUT_LOOP_PID=$!
  fi

  if [[ "${VNC_EXTENSION_AUDIO_INPUT:-true}" == "true" ]]; then
    start_mic_loop &
    MIC_LOOP_PID=$!
  fi
else
  log "ℹ️ FFmpeg not found, skipping audio streaming loops."
fi

# --- 5) start VNC --------------------------------------------------------

echo "${VNC_PASSWORD:-foobar}" | vncpasswd -f > "$HOME/.vnc/passwd"
chmod 600 "$HOME/.vnc/passwd"
if [ -d "$HOME/.config/tigervnc" ]; then
    cp "$HOME/.vnc/passwd" "$HOME/.config/tigervnc/passwd"
    chmod 600 "$HOME/.config/tigervnc/passwd"
fi

# Prepare xstartup
if [ $# -gt 0 ]; then
    log "📝 Creating custom xstartup for session: $*"
    cat > "$HOME/.vnc/xstartup" <<EOF
#!/bin/sh
unset SESSION_MANAGER
unset DBUS_SESSION_BUS_ADDRESS
exec dbus-run-session -- $*
EOF
else
    log "📝 Creating default xstartup..."
    cat > "$HOME/.vnc/xstartup" <<'EOF'
#!/bin/sh
unset SESSION_MANAGER
unset DBUS_SESSION_BUS_ADDRESS
if [ -x /usr/bin/x-session-manager ]; then
    exec dbus-run-session -- /usr/bin/x-session-manager
elif [ -x /usr/bin/x-window-manager ]; then
    exec dbus-run-session -- /usr/bin/x-window-manager
else
    exec dbus-run-session -- xterm
fi
EOF
fi
chmod +x "$HOME/.vnc/xstartup"
if [ -d "$HOME/.config/tigervnc" ]; then
    cp "$HOME/.vnc/xstartup" "$HOME/.config/tigervnc/xstartup"
fi

tigervncserver -kill :0 2>/dev/null || true
rm -f /tmp/.X0-lock /tmp/.X11-unix/X0 2>/dev/null || true

log "🖥️ Starting TigerVNC..."
exec tigervncserver :0 -geometry "${RESOLUTION:-1920x1080}" -rfbport "${PORT:-5901}" -localhost no -fg
