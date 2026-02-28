#!/bin/bash

if [[ -n "${MTX_PATHS_VNC_SOURCE}" || "${VNC_EXTENSION_AUDIO_INPUT}" == "true" ]]; then
  echo "▶️ Starting MediaMTX Server..."
  exec /mediamtx /mediamtx.yml
else
  echo "MediaMTX disabled."
  exit 0
fi
