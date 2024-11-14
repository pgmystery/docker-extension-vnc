#!/bin/bash

echo_error() { echo "$@" 1>&2; }


if [[ -z "${NONVC_REMOTE_SERVER}" ]]; then
  echo_error "The variable 'NONVC_REMOTE_SERVER' is not set!"
  exit 1
fi


./utils/novnc_proxy --vnc "${NONVC_REMOTE_SERVER}" --listen "${NOVNC_LISTEN_HOST}:${NOVNC_LISTEN_PORT}" "$*"
