# BUILD BACKEND
FROM golang:1.24.3-alpine AS builder
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
FROM --platform=$BUILDPLATFORM node:22.16-alpine AS lib-react-vnc
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

FROM --platform=$BUILDPLATFORM node:22.16-alpine AS client-builder
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
    org.opencontainers.image.description="A Docker Desktop Extension that enables you to connect to VNC servers running inside Docker containers or on remote hosts — directly from Docker Desktop." \
    org.opencontainers.image.vendor="pgmystery" \
    com.docker.desktop.extension.api.version=">= 0.3.4" \
    com.docker.extension.screenshots="[{\"alt\":\"Webbrowser on a linux desktop\", \"url\":\"https://raw.githubusercontent.com/pgmystery/docker-extension-vnc/refs/heads/main/docs/imgs/screenshot1.png\"},\
                                       {\"alt\":\"VNC settings\", \"url\":\"https://raw.githubusercontent.com/pgmystery/docker-extension-vnc/refs/heads/main/docs/imgs/screenshot2.png\"},\
                                       {\"alt\":\"VNC session cretendials\", \"url\":\"https://raw.githubusercontent.com/pgmystery/docker-extension-vnc/refs/heads/main/docs/imgs/screenshot3.png\"},\
                                       {\"alt\":\"Dashboard\", \"url\":\"https://raw.githubusercontent.com/pgmystery/docker-extension-vnc/refs/heads/main/docs/imgs/screenshot4.png\"},\
                                       {\"alt\":\"Remote Host connection windows machine\", \"url\":\"https://raw.githubusercontent.com/pgmystery/docker-extension-vnc/refs/heads/main/docs/imgs/screenshot8.png\"},\
                                       {\"alt\":\"Remote Host connection\", \"url\":\"https://raw.githubusercontent.com/pgmystery/docker-extension-vnc/refs/heads/main/docs/imgs/screenshot5.png\"},\
                                       {\"alt\":\"Edit Session\", \"url\":\"https://raw.githubusercontent.com/pgmystery/docker-extension-vnc/refs/heads/main/docs/imgs/screenshot6.png\"},\
                                       {\"alt\":\"Remote Host connection Linux Mint\", \"url\":\"https://raw.githubusercontent.com/pgmystery/docker-extension-vnc/refs/heads/main/docs/imgs/screenshot7.png\"}]" \
    com.docker.desktop.extension.icon="https://raw.githubusercontent.com/pgmystery/docker-extension-vnc/refs/heads/main/docker.svg" \
    com.docker.extension.detailed-description="<h1>Docker extension: <a href=\"https://hub.docker.com/extensions/pgmystery/docker-extension-vnc\">VNC Viewer</a></h1><p>A <a href=\"https://www.docker.com/products/extensions/\">Docker Desktop Extension</a> that enables you to connect to VNC servers running inside Docker containers or on remote hosts — directly from <a href=\"https://www.docker.com/products/docker-desktop/\">Docker Desktop</a>.</p><h2>Table of Contents</h2><ul><li><a href=\"#overview\">Overview</a></li><li><a href=\"#installation\">Installation</a><ul><li><a href=\"#install-via-docker-desktop-marketplace\">Install via Docker Desktop Marketplace</a></li><li><a href=\"#manual-installation\">Manual Installation</a></li></ul></li><li><a href=\"#usage\">Usage</a><ul><li><a href=\"#try-the-example-container\">Try the Example Container</a></li><li><a href=\"#working-with-sessions\">Working with Sessions</a><ul><li><a href=\"#connect-to-a-docker-container\">Connect to a Docker Container</a></li><li><a href=\"#run-from-a-docker-image\">Run from a Docker Image</a></li><li><a href=\"#connect-to-a-remote-host-linux-mac-or-windows\">Connect to a Remote Host (Linux, Mac or Windows)</a></li></ul></li></ul></li></ul><h2>Overview</h2><p>This Docker Desktop Extension allows you to connect to a <a href=\"https://en.wikipedia.org/wiki/VNC\">VNC</a> server running inside a Docker container or on a remote host. The extension creates a temporary Docker container that acts as a <a href=\"https://hub.docker.com/r/pgmystery/proxy_vnc\">proxy</a>, using <a href=\"https://github.com/novnc/noVNC\">noVNC</a> to provide a browser-based VNC client within Docker Desktop.</p><p>Key features:</p><ul><li>Connect to containers, images, or remote VNC servers.</li><li>Automatically manages Docker networking and cleanup.</li><li>Includes <a href=\"https://github.com/pgmystery/docker-extension-vnc/tree/main/docker/vnc_ubuntu\">multiple pre-configured example containers</a> to test the setup:<ul><li><a href=\"https://github.com/pgmystery/docker-extension-vnc/tree/main/docker/vnc_ubuntu/xfce\">Xfce</a></li><li><a href=\"https://github.com/pgmystery/docker-extension-vnc/tree/main/docker/vnc_ubuntu/cinnamon\">Cinnamon</a></li><li><a href=\"https://github.com/pgmystery/docker-extension-vnc/tree/main/docker/vnc_ubuntu/mate\">MATE</a></li><li><a href=\"https://github.com/pgmystery/docker-extension-vnc/tree/main/docker/vnc_ubuntu/kde-plasma\">KDE-Plasma</a></li><li><a href=\"https://github.com/pgmystery/docker-extension-vnc/tree/main/docker/vnc_ubuntu/lxde\">LXDE</a></li><li><a href=\"https://github.com/pgmystery/docker-extension-vnc/tree/main/docker/vnc_ubuntu/lxqt\">LXQT</a></li><li><a href=\"https://github.com/pgmystery/docker-extension-vnc/tree/main/docker/vnc_ubuntu/xterm\">xTerm</a></li></ul></li></ul><h2>Installation</h2><h3>Install via Docker Desktop Marketplace</h3><p><strong><a href=\"https://open.docker.com/extensions/marketplace?extensionId=pgmystery/docker-extension-vnc\">Click here to install via Docker Desktop Marketplace</a></strong></p><h3>Manual Installation</h3><p>You can also install the extension using the Docker CLI:</p><pre><code class=\"language-shell\">docker extension install pgmystery/docker-extension-vnc:1.3.1</code></pre><h2>Usage</h2><h3>Try the Example Container</h3><p>Quickly test the extension by clicking the “Try example container” button. This downloads and runs a pre-configured <a href=\"https://hub.docker.com/r/pgmystery/ubuntu_vnc\">Ubuntu VNC image</a> with a desktop environment.The container is created and automatically connected via the extension.</p><p>Available Environments:</p><ul><li><a href=\"https://github.com/pgmystery/docker-extension-vnc/tree/main/docker/vnc_ubuntu/xfce\">Xfce</a></li><li><a href=\"https://github.com/pgmystery/docker-extension-vnc/tree/main/docker/vnc_ubuntu/cinnamon\">Cinnamon</a></li><li><a href=\"https://github.com/pgmystery/docker-extension-vnc/tree/main/docker/vnc_ubuntu/mate\">MATE</a></li><li><a href=\"https://github.com/pgmystery/docker-extension-vnc/tree/main/docker/vnc_ubuntu/kde-plasma\">KDE-Plasma</a></li><li><a href=\"https://github.com/pgmystery/docker-extension-vnc/tree/main/docker/vnc_ubuntu/lxde\">LXDE</a></li><li><a href=\"https://github.com/pgmystery/docker-extension-vnc/tree/main/docker/vnc_ubuntu/lxqt\">LXQT</a></li><li><a href=\"https://github.com/pgmystery/docker-extension-vnc/tree/main/docker/vnc_ubuntu/xterm\">xTerm</a></li></ul><p><p><a href=\"https://raw.githubusercontent.com/pgmystery/docker-extension-vnc/refs/heads/main/docs/imgs/screenshot4.png\">Dashboard Screenshot</a></p></p><h3>Working with Sessions</h3><p>Sessions allow you to save and manage multiple VNC connection configurations. Each session is stored in a SQLite database inside a backend Docker container, using a Docker Volume for persistent storage.</p><p>To create a new session:</p><ol><li>Click the &quot;+&quot; icon.</li><li>Fill in the session details.</li><li>Save and click Connect.</li></ol><p>Supported connection types:</p><ul><li><a href=\"#connect-to-a-docker-container\">Docker Container</a></li><li><a href=\"#run-from-a-docker-image\">Docker Image</a></li><li><a href=\"#connect-to-a-remote-host-linux-mac-or-windows\">Remote Host</a></li></ul><p><p><a href=\"https://raw.githubusercontent.com/pgmystery/docker-extension-vnc/refs/heads/main/docs/imgs/screenshot6.png\">Edit Session Screenshot</a></p></p><h4>Connect to a Docker Container</h4><ol><li>Enter a unique Session name.</li><li>Choose <strong>Docker Container</strong> as the connection type.</li><li>Select a running Container from the dropdown, or enter its name/ID manually.</li><li>Specify the internal VNC server port by enter the port or select it (it doesn&#39;t need to be exposed)</li><li>(<em>Optional</em>) Enter the credentials for the VNC connection if you want to store them.</li><li>Save the Session.</li><li>Click <strong>Connect</strong>.</li></ol><p><p><a href=\"https://raw.githubusercontent.com/pgmystery/docker-extension-vnc/refs/heads/main/docs/imgs/screenshot1.png\">Webbrowser on a linux desktop Screenshot</a></p></p><h4>Run from a Docker Image</h4><ol><li>Enter a unique Session name.</li><li>Choose *<em>Docker Image</em> as the connection type.</li><li>Select a VNC-enabled Docker Image from the Docker-Hub or locally (e.g., <a href=\"https://hub.docker.com/r/selenium/standalone-chrome-debug\">selenium/standalone-chrome-debug</a>).</li><li>Select the image tag.</li><li>(<em>Optional</em>) Add <a href=\"https://docs.docker.com/reference/cli/docker/container/run/#options\">Docker Run Options</a>.</li><li>(<em>Optional</em>) Specify a custom <a href=\"https://docs.docker.com/engine/containers/run/#commands-and-arguments\">Docker Run command with Args</a>.</li><li>Specify the VNC-Server port.</li><li>Choose whether to remove the Container after disconnecting or keep it alive.</li><li>(<em>Optional</em>) Enter the credentials for the VNC connection if you want to store them.</li><li>Save the Session.</li><li>Click <strong>Connect</strong>.</li></ol><h4>Connect to a Remote Host (Linux, Mac or Windows)</h4><ol><li>Enter a unique Session name.</li><li>Choose <strong>Remote Host</strong> as the connection type.</li><li>Enter the IP-Address of the remote host.</li><li>Specify the VNC-Server port.</li><li>(<em>Optional</em>) Enter the credentials for the VNC connection if you want to store them.</li><li>Save the Session.</li><li>Click <strong>Connect</strong>.</li></ol><p><p><a href=\"https://raw.githubusercontent.com/pgmystery/docker-extension-vnc/refs/heads/main/docs/imgs/screenshot5.png\">Remote Host connection Screenshot</a></p><p><a href=\"https://raw.githubusercontent.com/pgmystery/docker-extension-vnc/refs/heads/main/docs/imgs/screenshot8.png\">Remote Host connection windows machine Screenshot</a></p><p><a href=\"https://raw.githubusercontent.com/pgmystery/docker-extension-vnc/refs/heads/main/docs/imgs/screenshot7.png\">Remote Host connection Linux Mint Screenshot</a></p></p>" \
    com.docker.extension.publisher-url="https://github.com/pgmystery" \
    com.docker.extension.additional-urls="[{\"title\":\"GitHub\",\"url\":\"https://github.com/pgmystery/docker-extension-vnc\"},\
                                           {\"title\":\"License\",\"url\":\"https://github.com/pgmystery/docker-extension-vnc/blob/main/LICENSE\"}]" \
    com.docker.extension.categories="utility-tools,testing-tools" \
    com.docker.extension.changelog="See full <a href=\"https://github.com/pgmystery/docker-extension-vnc/blob/main/CHANGELOG.md\">change log</a>"

WORKDIR /

COPY backend/prod.backend.env ./backend.env
COPY --from=builder /backend/bin/service /
COPY docker-compose.yaml .
COPY metadata.json .
COPY docker.svg .
COPY --from=client-builder /ui/build ui

CMD ["/service", "-socket", "/run/guest-services/backend.sock"]
