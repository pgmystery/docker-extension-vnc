#!/bin/bash

echo 'Updating /etc/hosts file...'
HOSTNAME=$(hostname)
echo "127.0.1.1\t$HOSTNAME" >> /etc/hosts

echo "Starting VNC server at $RESOLUTION..."
vncserver -kill :0 || true
vncserver -kill :1 || true
rm -f /tmp/.X0-lock
rm -f /tmp/.X11-unix/X0
rm -f /tmp/.X1-lock
rm -f /tmp/.X11-unix/X1
vncserver :1 -geometry $RESOLUTION -rfbport 5901 &

echo "VNC server started at $RESOLUTION! ^-^"

echo "Starting tail -f /dev/null..."
tail -f /dev/null
