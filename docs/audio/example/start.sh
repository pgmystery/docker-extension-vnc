#!/bin/bash
set -eo pipefail

echo "========================================="
echo " Starting Custom Audio-Enabled Container "
echo "========================================="

# ---------------------------------------------------------
# 1. Configure and Start PulseAudio
# ---------------------------------------------------------
echo "🔊 Configuring PulseAudio..."

export RUNTIME_DIR="/tmp/runtime"
export PULSE_RUNTIME_PATH="$RUNTIME_DIR/pulse"
export PULSE_SERVER="unix:$PULSE_RUNTIME_PATH/native"

mkdir -p "$PULSE_RUNTIME_PATH"
chmod 700 "$PULSE_RUNTIME_PATH"
mkdir -p "$HOME/.config/pulse"

# Create minimal PulseAudio configs
cat > "$HOME/.config/pulse/daemon.conf" <<EOF
daemonize = yes
system-instance = no
allow-exit = no
exit-idle-time = -1
enable-shm = no
realtime-scheduling = no
EOF

cat > "$HOME/.config/pulse/client.conf" <<EOF
autospawn = no
default-server = $PULSE_SERVER
EOF

# Start the PulseAudio daemon
echo "🔊 Starting PulseAudio daemon..."
pulseaudio --daemonize=yes --log-target=stderr --realtime=no

# Wait for the socket to become available
for i in {1..30}; do
    if [ -S "$PULSE_RUNTIME_PATH/native" ]; then
        break
    fi
    sleep 0.2
done

# ---------------------------------------------------------
# 2. Create Virtual Audio Devices
# ---------------------------------------------------------
echo "🎛️ Creating PulseAudio Virtual Devices..."

# A. Audio Output Sink (Apps play audio out to this sink)
pactl load-module module-null-sink \
    sink_name=virtual_sink \
    sink_properties=device.description=Virtual_Sink

pactl set-default-sink virtual_sink

# B. Audio Input Sink & Remapping (Incoming mic audio plays here, remapped as a microphone)
pactl load-module module-null-sink \
    sink_name=mic_sink \
    sink_properties=device.description=Virtual_Mic_Input

pactl load-module module-remap-source \
    master=mic_sink.monitor \
    source_name=virtmic \
    source_properties=device.description=Virtual_Microphone

pactl set-default-source virtmic

# ---------------------------------------------------------
# 3. Start FFmpeg Streaming Loops in Background
# ---------------------------------------------------------
echo "🚀 Starting FFmpeg background streaming loops..."

# A. Audio Output Supervisor (Streams container audio out to the proxy on port 7900)
start_audio_output_loop() {
  while true; do
    ffmpeg -loglevel error -nostdin \
      -f pulse -i "virtual_sink.monitor" \
      -c:a libopus -b:a 96k -vbr off -compression_level 5 \
      -frame_duration 10 -application lowdelay \
      -f mpegts -pes_payload_size 0 -flush_packets 1 \
      "srt://0.0.0.0:7900?mode=listener&latency=0"
    sleep 1
  done
}
start_audio_output_loop &

# B. Mic Input Supervisor (Pulls browser mic audio from the proxy on port 8890)
start_mic_loop() {
  export SRT_LOG_LEVEL=error
  while true; do
    # Check if proxy is available before committing to the full stream read
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
start_mic_loop &

# ---------------------------------------------------------
# 4. Start VNC Server (Desktop Environment)
# ---------------------------------------------------------
echo "🖥️ Setting up VNC Password and starting server..."

# Set a default VNC password (usually handled dynamically, hardcoded here for example)
mkdir -p "$HOME/.vnc"
echo "vncpass" | vncpasswd -f > "$HOME/.vnc/passwd"
chmod 600 "$HOME/.vnc/passwd"

# Create a basic xstartup file for XFCE
cat > "$HOME/.vnc/xstartup" <<'EOF'
#!/bin/sh
unset SESSION_MANAGER
unset DBUS_SESSION_BUS_ADDRESS
exec dbus-run-session -- startxfce4
EOF
chmod +x "$HOME/.vnc/xstartup"

# Keep the container alive by running TigerVNC in the foreground (-fg)
echo "🖥️ Launching TigerVNC..."
exec tigervncserver :0 -fg -geometry 1280x720 -localhost no
