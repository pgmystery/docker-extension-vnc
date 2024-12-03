#!/bin/bash

echo 'Updating /etc/hosts file...'
HOSTNAME=$(hostname)
echo "127.0.1.1\t$HOSTNAME" >> /etc/hosts

echo "Starting tiger VNC server at $RESOLUTION..."
tigervncserver -kill :0 || true
tigervncserver -kill :1 || true
rm -f /tmp/.X0-lock
rm -f /tmp/.X11-unix/X0
rm -f /tmp/.X1-lock
rm -f /tmp/.X11-unix/X1

tigervncserver :1 -geometry "$RESOLUTION" -rfbport "$PORT" -localhost no -fg
