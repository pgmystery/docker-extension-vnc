#!/bin/bash

echo_error() { echo "$@" 1>&2; }

if [[ -z "${NOVNC_REMOTE_SERVER}" ]]; then
  echo_error "The variable 'NOVNC_REMOTE_SERVER' is not set!"
  exit 1
fi

if [[ -n "${MTX_PATHS_VNC_SOURCE}" || "${VNC_EXTENSION_AUDIO_INPUT}" == "true" || "${VNC_EXTENSION_AUDIO_OUTPUT}" == "true" ]]; then
  echo "▶️ Starting MediaMTX Server..."
  /mediamtx /mediamtx.yml &
fi

./utils/novnc_proxy --vnc "${NOVNC_REMOTE_SERVER}" --listen "${NOVNC_LISTEN_HOST}:${NOVNC_LISTEN_PORT}" $*
