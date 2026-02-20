# BUILD MediaMTX
FROM golang:1.25.7-alpine AS mediamtx_builder

ARG MEDIAMTX_VERSION="1.16.1"

RUN wget https://github.com/bluenviron/mediamtx/archive/refs/tags/v$MEDIAMTX_VERSION.zip
RUN unzip v$MEDIAMTX_VERSION.zip

WORKDIR /go/mediamtx-$MEDIAMTX_VERSION

RUN go generate ./... && \
    CGO_enabled=0 go build . && \
    mv mediamtx ../mediamtx

FROM python:3.12

ARG NOVNC_VERSION="v1.6.0"
ARG WEBSOCKIFY_VERSION="v0.13.0"

ENV NOVNC_LISTEN_HOST="0.0.0.0"
ENV NOVNC_LISTEN_PORT=6081
ENV MEDIAMTX_LISTEN_PORT=7900

RUN git clone --depth 1 --branch $NOVNC_VERSION https://github.com/novnc/noVNC.git

WORKDIR /noVNC

RUN git clone --depth 1 --branch $WEBSOCKIFY_VERSION https://github.com/novnc/websockify ./utils/websockify
RUN pip3 install numpy

COPY --from=mediamtx_builder /go/mediamtx /mediamtx
COPY ./config/mediamtx.yml /mediamtx.yml

COPY ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE $NOVNC_LISTEN_PORT
EXPOSE $MEDIAMTX_LISTEN_PORT

ENTRYPOINT ["/entrypoint.sh"]
