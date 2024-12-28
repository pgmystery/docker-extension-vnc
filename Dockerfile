# BUILD BACKEND
FROM golang:1.23-alpine AS builder
ENV CGO_ENABLED=1
WORKDIR /backend
RUN apk add --no-cache gcc musl-dev
COPY backend/go.* .
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    go mod download
COPY backend/. .
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    go build -trimpath -ldflags="-s -w" -o bin/service

# BUILD lib react-vnc
FROM --platform=$BUILDPLATFORM node:22.12-alpine AS lib-react-vnc
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

FROM --platform=$BUILDPLATFORM node:22.12-alpine AS client-builder
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
    org.opencontainers.image.description="Docker Desktop Extension for connecting to a VNC Server Container or Remote Host and control it over an built-in view." \
    org.opencontainers.image.vendor="pgmystery" \
    com.docker.desktop.extension.api.version=">= 0.3.4" \
    com.docker.extension.screenshots="[{\"alt\":\"Webbrowser on a linux desktop\", \"url\":\"https://raw.githubusercontent.com/pgmystery/docker-extension-vnc/refs/heads/main/docs/imgs/screenshot1.png\"},\
                                       {\"alt\":\"VNC settings\", \"url\":\"https://raw.githubusercontent.com/pgmystery/docker-extension-vnc/refs/heads/main/docs/imgs/screenshot2.png\"},\
                                       {\"alt\":\"VNC session cretendials\", \"url\":\"https://raw.githubusercontent.com/pgmystery/docker-extension-vnc/refs/heads/main/docs/imgs/screenshot3.png\"},\
                                       {\"alt\":\"Dashboard\", \"url\":\"https://raw.githubusercontent.com/pgmystery/docker-extension-vnc/refs/heads/main/docs/imgs/screenshot4.png\"},\
                                       {\"alt\":\"Remote Host connection\", \"url\":\"https://raw.githubusercontent.com/pgmystery/docker-extension-vnc/refs/heads/main/docs/imgs/screenshot5.png\"},\
                                       {\"alt\":\"Edit Session\", \"url\":\"https://raw.githubusercontent.com/pgmystery/docker-extension-vnc/refs/heads/main/docs/imgs/screenshot6.png\"}]" \
    com.docker.desktop.extension.icon="https://raw.githubusercontent.com/pgmystery/docker-extension-vnc/refs/heads/main/docker.svg" \
    com.docker.extension.detailed-description="<h1 id=docker-extension-vnc>Docker extension: VNC Viewer</h1><p>A VNC Viewer extension for Docker Desktop.<h2 id=table-of-contents>Table of Contents</h2><ul><li><a href=#description>Description</a><li><a href=#manual-installation>Manual Installation</a><li><a href=#usage>Usage</a><ul><li><a href=#the-example-container>Example Container</a><li><a href=#sessions>Sessions</a><ul><li><a href=#docker-container>Docker Container</a><li><a href=#remote-host>Remote Host</a></ul></ul></ul><h2 id=description>Description</h2><p>This Docker Desktop extension is for connecting to Docker Containers or a Remote Host which have a <a href=https://en.wikipedia.org/wiki/VNC>VNC</a> Server running.<p>The extension creates a Docker Container as a <a href=https://hub.docker.com/r/pgmystery/proxy_vnc>proxy</a> for connecting to the target VNC Server and shows the view inside of Docker Desktop.<p>If the connection is to a Docker Container, then the extension creates a Docker Network and adds the proxy and the target container to the Network. Only this way, the proxy can access the VNC server container. After disconnect, it deletes the proxy container and removes the VNC server Container from the Network.<p>It uses <a href=https://github.com/novnc/noVNC>noVNC</a> as the JavaScript client package.<p>It also comes with an example VNC Server as a docker container. So you can test things out very easily.<h2 id=manual-installation>Manual Installation</h2><p>You can install the extension by using the command:<pre><code class=lang-shell>docker <span class=hljs-keyword>extension</span> install pgmystery/docker-<span class=hljs-keyword>extension</span>-vnc:<span class=hljs-number>1.1</span>.<span class=hljs-number>0</span></code></pre><h2 id=usage>Usage</h2><h3 id=the-example-container>The example Container</h3><p>You can right start by seeing the possibility of this extension if you just click the button \"Try example container\". It will download an <a href=https://hub.docker.com/r/pgmystery/ubuntu_vnc>example Docker Image</a> with a vnc server and a Desktop installed. It will also then automatically creates the Container and a connection to the container in the extension will be accomplished.<p><a href=https://raw.githubusercontent.com/pgmystery/docker-extension-vnc/refs/heads/main/docs/imgs/screenshot4.png>Dashboard Screenshot</a><h3 id=sessions>Sessions</h3><p>To switch the target and the connection, you can create Sessions. The Sessions are saved in the Backend Docker Container in a SQLite Database. For that, this extension use a Docker Volume for saving the data on the host.<p>To create a new Session, just click on the plus icon button. Now you can enter the Session name, the connection type with data and optional the credentials.<p><a href=https://raw.githubusercontent.com/pgmystery/docker-extension-vnc/refs/heads/main/docs/imgs/screenshot6.png>Edit Session Screenshot</a><p>This extension supports 2 different kind of connections.<ul><li><a href=#docker-container>Docker Container</a><li><a href=#remote-host>Remote Host</a></ul><h4 id=docker-container>Docker Container</h4><ol><li>Select the connection type \"Docker Container\".<li>Select the Container from the list (if the container is not showing up, you can also manually insert the Container Name or ID).<li>Enter or select the port on which the vnc server is listening on (it is an internal port, it don't need to be exposed to the host).<li>Save the Session.<li>Click on \"Connect\".</ol><p><a href=https://raw.githubusercontent.com/pgmystery/docker-extension-vnc/refs/heads/main/docs/imgs/screenshot1.png>Webbrowser on a linux desktop Screenshot</a><h4 id=remote-host>Remote Host</h4><ol><li>Select the connection type \"Remote Host\".<li>Enter the IP of the Host you have access to.<li>Type in the port of the VNC Server on the Remote Host.<li>Save the Session.<li>Click on \"Connect\".</ol><p><a href=https://raw.githubusercontent.com/pgmystery/docker-extension-vnc/refs/heads/main/docs/imgs/screenshot5.png>Remote Host connection Screenshot</a>" \
    com.docker.extension.publisher-url="https://github.com/pgmystery" \
    com.docker.extension.additional-urls="[{\"title\":\"GitHub\",\"url\":\"https://github.com/pgmystery/docker-extension-vnc\"},\
                                           {\"title\":\"License\",\"url\":\"https://github.com/pgmystery/docker-extension-vnc/blob/main/LICENSE\"}]" \
    com.docker.extension.categories="networking" \
    com.docker.extension.changelog="See full <a href=\"https://github.com/pgmystery/docker-extension-vnc/blob/main/CHANGELOG.md\">change log</a>"

WORKDIR /

COPY backend/prod.backend.env ./backend.env
COPY --from=builder /backend/bin/service /
COPY docker-compose.yaml .
COPY metadata.json .
COPY docker.svg .
COPY --from=client-builder /ui/build ui

CMD ["/service", "-socket", "/run/guest-services/backend.sock"]
