#FROM golang:1.23-alpine AS builder
#ENV CGO_ENABLED=0
#WORKDIR /backend
#COPY backend/go.* .
#RUN --mount=type=cache,target=/go/pkg/mod \
#    --mount=type=cache,target=/root/.cache/go-build \
#    go mod download
#COPY backend/. .
#RUN --mount=type=cache,target=/go/pkg/mod \
#    --mount=type=cache,target=/root/.cache/go-build \
#    go build -trimpath -ldflags="-s -w" -o bin/service

#FROM python:3.12 AS backend-builder
#ENV NOVNC_LISTEN_PORT=6081
#ENV NOVNC_VERSION="v1.5.0"
#WORKDIR /backend
#COPY ./backend ./backend
#COPY pyproject.toml poetry.lock README.md ./
#RUN git clone --depth 1 --branch $NOVNC_VERSION https://github.com/novnc/noVNC.git
#RUN pip install --no-cache-dir --upgrade poetry
#RUN poetry config virtualenvs.create false
#RUN poetry install

# BUILD lib react-vnc
FROM --platform=$BUILDPLATFORM node:22.11-alpine AS lib-react-vnc
RUN apk add git
WORKDIR /react-vnc
COPY .git ./.git
COPY .gitmodules ./.gitmodules
COPY ui/libs/react-vnc ./ui/libs/react-vnc
RUN git submodule update --init --recursive
RUN --mount=type=cache,target=/usr/src/app/.npm \
    npm --prefix ./ui/libs/react-vnc set cache /usr/src/app/.npm && \
    npm ci --prefix ./ui/libs/react-vnc
RUN npm --prefix ./ui/libs/react-vnc run build:lib

FROM --platform=$BUILDPLATFORM node:22.11-alpine AS client-builder
WORKDIR /ui
# cache packages in layer
COPY ui/package.json /ui/package.json
COPY ui/package-lock.json /ui/package-lock.json
COPY /ui/.env /ui/.env
RUN --mount=type=cache,target=/usr/src/app/.npm \
    npm set cache /usr/src/app/.npm && \
    npm ci
# install
COPY ui /ui
# copy libs
COPY --from=lib-react-vnc /react-vnc/ui/libs/react-vnc/dist /ui/libs/react-vnc/dist
RUN npm run build

FROM alpine
#FROM backend-builder
LABEL org.opencontainers.image.title="vnc" \
    org.opencontainers.image.description="VNC extension for docker desktop" \
    org.opencontainers.image.vendor="" \
    com.docker.desktop.extension.api.version="0.3.4" \
    com.docker.extension.screenshots="" \
    com.docker.desktop.extension.icon="" \
    com.docker.extension.detailed-description="" \
    com.docker.extension.publisher-url="" \
    com.docker.extension.additional-urls="" \
    com.docker.extension.categories="" \
    com.docker.extension.changelog=""

WORKDIR /

#COPY --from=builder /backend/prod.backend.env /backend.env
#COPY --from=builder /backend/bin/service /
#COPY docker-compose.yaml .
COPY metadata.json .
COPY docker.svg .
COPY --from=client-builder /ui/build ui

RUN mkdir -p /run/guest-services/

CMD /service -socket /run/guest-services/backend.sock
#CMD uvicorn --root-path ./backend --uds /run/guest-services/backend.sock backend.main:app
