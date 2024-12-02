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
COPY --from=lib-react-vnc /react-vnc/ui/libs/react-vnc/dist /ui/libs/react-vnc/dist
RUN npm run build

FROM alpine
LABEL org.opencontainers.image.title="VNC Viewer" \
    org.opencontainers.image.description="Docker Extension for connecting to a VNC Server Container and control it over an built-in view." \
    org.opencontainers.image.vendor="pgmystery" \
    com.docker.desktop.extension.api.version=">= 0.3.4" \
    com.docker.extension.screenshots="[{\"alt\":\"Webbrowser on a linux desktop\", \"url\":\"https://raw.githubusercontent.com/pgmystery/docker-extension-vnc/refs/heads/main/docs/imgs/screenshot1.png\"},\
                                       {\"alt\":\"VNC settings\", \"url\":\"https://raw.githubusercontent.com/pgmystery/docker-extension-vnc/refs/heads/main/docs/imgs/screenshot2.png\"},\
                                       {\"alt\":\"VNC session cretendials\", \"url\":\"https://raw.githubusercontent.com/pgmystery/docker-extension-vnc/refs/heads/main/docs/imgs/screenshot3.png\"},\
                                       {\"alt\":\"Dashboard\", \"url\":\"https://raw.githubusercontent.com/pgmystery/docker-extension-vnc/refs/heads/main/docs/imgs/screenshot4.png\"},\
                                       {\"alt\":\"Remote Host connection\", \"url\":\"https://raw.githubusercontent.com/pgmystery/docker-extension-vnc/refs/heads/main/docs/imgs/screenshot5.png\"}]" \
    com.docker.desktop.extension.icon="https://raw.githubusercontent.com/pgmystery/docker-extension-vnc/refs/heads/main/docker.svg" \
    com.docker.extension.detailed-description="Docker Desktop Extension for connecting to a VNC Server Container or Remote Host and control it over an built-in view." \
    com.docker.extension.publisher-url="https://github.com/pgmystery/docker-extension-vnc" \
    com.docker.extension.additional-urls="[{\"title\":\"Documentation\",\"url\":\"https://github.com/pgmystery/docker-extension-vnc/blob/main/README.md\"},\
                                           {\"title\":\"License\",\"url\":\"https://github.com/pgmystery/docker-extension-vnc/blob/main/LICENSE\"}]" \
    com.docker.extension.categories="networking" \
    com.docker.extension.changelog="See full <a href=\"https://github.com/pgmystery/docker-extension-vnc/blob/main/CHANGELOG.md\">change log</a>"

WORKDIR /

COPY metadata.json .
COPY docker.svg .
COPY --from=client-builder /ui/build ui

RUN mkdir -p /run/guest-services/

CMD /service -socket /run/guest-services/backend.sock
