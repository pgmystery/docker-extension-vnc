#!/bin/sh
set -eu

log() { echo "[$(date +'%H:%M:%S')] $*"; }

export HOME="${HOME:-/home/vncuser}"
export DISPLAY=:0
export RESOLUTION="${RESOLUTION:-1280x720}"

# 1) Prepare VNC directory
mkdir -p "$HOME/.vnc"
echo "${VNC_PASSWORD:-foobar}" | vncpasswd -f > "$HOME/.vnc/passwd"
chmod 600 "$HOME/.vnc/passwd"

log "🖥️ Starting Xvnc..."
# Launch Xvnc in background with explicit font path
Xvnc :0 -geometry "$RESOLUTION" -rfbport "${PORT:-5901}" -rfbauth "$HOME/.vnc/passwd" -localhost no -SecurityTypes VncAuth -fp /usr/share/fonts/misc &
XVNC_PID=$!

# Wait for X server to be ready
i=0
while [ $i -lt 10 ]; do
    if xset q > /dev/null 2>&1; then
        log "✅ X server is ready."
        break
    fi
    sleep 1
    i=$((i + 1))
done

log "🚀 Starting Fluxbox..."
fluxbox &
# shellcheck disable=SC2034
FLUXBOX_PID=$!

log "✅ Alpine Minimal VNC is running."

# Wait for Xvnc (the main process)
wait $XVNC_PID
