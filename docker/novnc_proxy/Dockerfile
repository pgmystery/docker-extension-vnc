FROM golang:1.26.0-alpine AS mediamtx_builder

ARG MEDIAMTX_VERSION="1.16.2"

RUN wget https://github.com/bluenviron/mediamtx/archive/refs/tags/v$MEDIAMTX_VERSION.zip
RUN unzip v$MEDIAMTX_VERSION.zip

WORKDIR /go/mediamtx-$MEDIAMTX_VERSION

RUN go generate ./... && \
    CGO_enabled=0 go build . && \
    mv mediamtx ../mediamtx

FROM python:3.12-slim

ARG NOVNC_VERSION="v1.6.0"
ARG WEBSOCKIFY_VERSION="v0.13.0"

ENV NOVNC_LISTEN_HOST="0.0.0.0" \
    NOVNC_LISTEN_PORT=6081 \
    MEDIAMTX_LISTEN_PORT=7900

WORKDIR /noVNC

# Install dependencies and setup noVNC in one layer
RUN apt-get update && apt-get install -y --no-install-recommends \
    supervisor \
    git \
    procps \
    nginx \
    coturn \
    gettext-base \
    && git clone --depth 1 --branch $NOVNC_VERSION https://github.com/novnc/noVNC.git /noVNC \
    && git clone --depth 1 --branch $WEBSOCKIFY_VERSION https://github.com/novnc/websockify /noVNC/utils/websockify \
    && pip3 install --no-cache-dir numpy \
    && apt-get purge -y git && apt-get autoremove -y \
    && apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN ln -sf /dev/stdout /var/log/nginx/access.log && \
    ln -sf /dev/stderr /var/log/nginx/error.log

# Copy configs and scripts
COPY --from=mediamtx_builder /go/mediamtx /mediamtx
COPY ./config/mediamtx.yml /mediamtx.yml
COPY ./config/nginx.conf /etc/nginx/nginx.conf.template
COPY ./config/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

COPY ./scripts/start-mediamtx.sh /start-mediamtx.sh
COPY ./entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh /start-mediamtx.sh

EXPOSE $NOVNC_LISTEN_PORT
EXPOSE $MEDIAMTX_LISTEN_PORT

ENTRYPOINT ["/entrypoint.sh"]
