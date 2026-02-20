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

  # Stop VNC if this script is re-used in the same container session
  tigervncserver -kill :0 2>/dev/null || true
  rm -f /tmp/.X0-lock /tmp/.X11-unix/X0 2>/dev/null || true

  if command -v pactl >/dev/null 2>&1; then
    if pactl info >/dev/null 2>&1; then
      [[ -n "${PA_MOD_VIRTUAL_SINK_ID:-}" ]] && pactl unload-module "${PA_MOD_VIRTUAL_SINK_ID}" >/dev/null 2>&1 || true
      [[ -n "${PA_MOD_MIC_SINK_ID:-}"     ]] && pactl unload-module "${PA_MOD_MIC_SINK_ID}"     >/dev/null 2>&1 || true
      [[ -n "${PA_MOD_REMAP_SRC_ID:-}"    ]] && pactl unload-module "${PA_MOD_REMAP_SRC_ID}"    >/dev/null 2>&1 || true
    fi
  fi

  pulseaudio --check >/dev/null 2>&1 && pulseaudio -k >/dev/null 2>&1 || true
  rm -rf "${XDG_RUNTIME_DIR:-/tmp/runtime}/pulse" /var/run/pulse /tmp/pulse-daemon.conf 2>/dev/null || true
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
      pactl info || true
      pactl list short sinks || true
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
    ffmpeg -nostdin \
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
  log "🎤 Starting FFmpeg supervisor (virtual mic input)..."
  while true; do
    ffmpeg -nostdin -v quiet \
      -i "srt://vnc-viewer-proxy:8890?streamid=read:mic&latency=20" \
      -c:a pcm_s16le -ar 48000 -ac 2 \
      -f pulse "mic_sink"
    sleep 2
  done
}

# --- 1) environment -------------------------------------------------------

export HOME="${HOME:-/root}"
export XDG_RUNTIME_DIR="${XDG_RUNTIME_DIR:-/tmp/runtime}"
mkdir -p "$XDG_RUNTIME_DIR"
chmod 700 "$XDG_RUNTIME_DIR"

export PULSE_RUNTIME_PATH="$XDG_RUNTIME_DIR/pulse"
export PULSE_SERVER="unix:$PULSE_RUNTIME_PATH/native"

# Ensure user pulse config forces NON-system mode + no SHM (container safe)
mkdir -p "$HOME/.config/pulse"
cat > "$HOME/.config/pulse/daemon.conf" <<'EOF'
daemonize = yes
system-instance = no
allow-exit = no
exit-idle-time = -1
enable-shm = no
realtime-scheduling = no
EOF

# Prevent tools (pactl/ffmpeg) from trying to autospawn PA with wrong settings
cat > "$HOME/.config/pulse/client.conf" <<EOF
autospawn = no
default-server = ${PULSE_SERVER}
EOF

# Clean stale PA runtime from previous run in the same container
rm -rf "$PULSE_RUNTIME_PATH" /var/run/pulse 2>/dev/null || true
mkdir -p "$PULSE_RUNTIME_PATH"
chmod 700 "$PULSE_RUNTIME_PATH"

# --- 2) start PulseAudio (user mode) --------------------------------------

if pulseaudio --check >/dev/null 2>&1; then
  log "PulseAudio already running; stopping it first..."
  pulseaudio -k || true
  sleep 0.2
fi

log "🔊 Starting PulseAudio (user mode, config in $HOME/.config/pulse)..."
pulseaudio --daemonize=yes --log-target=stderr --realtime=no

wait_for_pa "$PULSE_RUNTIME_PATH/native"

# --- 3) create virtual devices (idempotent-ish) ---------------------------

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

# --- 4) start streaming loops --------------------------------------------

if [[ "${VNC_EXTENSION_AUDIO_OUTPUT:-true}" == "true" ]]; then
  start_audio_output_loop &
  AUDIO_OUT_LOOP_PID=$!
fi

if [[ "${VNC_EXTENSION_AUDIO_INPUT:-true}" == "true" ]]; then
  start_mic_loop &
  MIC_LOOP_PID=$!
fi

# --- 5) start VNC (foreground / exec) ------------------------------------

echo "${VNC_PASSWORD:-changeme}" | vncpasswd -f > /root/.vnc/passwd
chmod 600 /root/.vnc/passwd

tigervncserver -kill :0 2>/dev/null || true
rm -f /tmp/.X0-lock /tmp/.X11-unix/X0 2>/dev/null || true

log "🖥️ Starting TigerVNC..."
exec tigervncserver :0 -geometry "${RESOLUTION:-1920x1080}" -rfbport "${PORT:-5901}" -localhost no -fg "$@"
