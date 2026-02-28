#!/bin/bash
set -e

echo_error() { echo "$@" 1>&2; }

if [[ -z "${NOVNC_REMOTE_SERVER}" ]]; then
  echo_error "The variable 'NOVNC_REMOTE_SERVER' is not set!"
  exit 1
fi

envsubst '${SELKIES_URL} ${SELKIES_WS_URL}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

exec /usr/bin/supervisord -n -c /etc/supervisor/conf.d/supervisord.conf
