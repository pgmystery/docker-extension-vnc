#!/bin/bash

echo "$VNC_PASSWORD" | vncpasswd -f > /root/.vnc/passwd
chmod 600 /root/.vnc/passwd

echo "Starting tiger VNC server at $RESOLUTION..."
tigervncserver -kill :0 || true
rm -f /tmp/.X0-lock
rm -f /tmp/.X11-unix/X0

tigervncserver :0 -geometry "$RESOLUTION" -rfbport "$PORT" -localhost no -fg $*
