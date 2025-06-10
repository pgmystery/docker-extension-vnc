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
    com.docker.extension.detailed-description="<h1>🐳 Docker Extension: <a href=\"https://hub.docker.com/extensions/pgmystery/docker-extension-vnc\">VNC Viewer</a> 🖥️</h1><p>A <a href=\"https://www.docker.com/products/extensions/\">Docker Desktop Extension</a> that allows you to connect to VNC servers running inside Docker containers or on remote hosts — directly from <a href=\"https://www.docker.com/products/docker-desktop/\">Docker Desktop</a>.</p><hr><h2>📚 Table of Contents</h2><ul><li><a href=\"#-overview\">Overview</a></li><li><a href=\"#-key-features\">Features</a></li><li><a href=\"#-what-you-can-do\">What You Can Do</a></li><li><a href=\"#-why-use-this-extension\">Why Use This Extension</a></li><li><a href=\"#-installation\">Installation</a><ul><li><a href=\"#-install-from-docker-marketplace\">Install from Docker Marketplace</a></li><li><a href=\"#-manual-installation\">Manual Installation</a></li></ul></li><li><a href=\"#-usage\">Usage</a><ul><li><a href=\"#-try-the-example-container\">Try the Example Container</a></li><li><a href=\"#-working-with-sessions\">Working with Sessions</a><ul><li><a href=\"#-connect-to-a-docker-container\">Connect to a Docker Container</a></li><li><a href=\"#-run-from-a-docker-image\">Run from a Docker Image</a></li><li><a href=\"#-connect-to-a-remote-host\">Connect to a Remote Host</a></li></ul></li></ul></li></ul><hr><h2>🧭 Overview</h2><p>This Docker Desktop Extension creates a temporary proxy container using <a href=\"https://github.com/novnc/noVNC\">noVNC</a>, giving you browser-based access to any VNC server — whether it&#39;s inside another container or running on a remote host.</p><h3>🔑 Key Features</h3><ul><li>Connect to Docker containers, images, or remote VNC servers</li><li>Automatic Docker networking and cleanup</li><li>Secure session management with persistent storage</li><li>Includes pre-built environments:<ul><li><a href=\"https://github.com/pgmystery/docker-extension-vnc/tree/main/docker/vnc_ubuntu/xfce\">Xfce</a></li><li><a href=\"https://github.com/pgmystery/docker-extension-vnc/tree/main/docker/vnc_ubuntu/cinnamon\">Cinnamon</a></li><li><a href=\"https://github.com/pgmystery/docker-extension-vnc/tree/main/docker/vnc_ubuntu/mate\">MATE</a></li><li><a href=\"https://github.com/pgmystery/docker-extension-vnc/tree/main/docker/vnc_ubuntu/kde-plasma\">KDE-Plasma</a></li><li><a href=\"https://github.com/pgmystery/docker-extension-vnc/tree/main/docker/vnc_ubuntu/lxde\">LXDE</a></li><li><a href=\"https://github.com/pgmystery/docker-extension-vnc/tree/main/docker/vnc_ubuntu/lxqt\">LXQT</a></li><li><a href=\"https://github.com/pgmystery/docker-extension-vnc/tree/main/docker/vnc_ubuntu/xterm\">xTerm</a></li></ul></li></ul><hr><h2>🚀 What You Can Do</h2><h3>🖥️ Run GUI-Based Linux Applications</h3><p>Launch popular apps without installing anything on your host:</p><ul><li><p>Browsers (Firefox, Chromium)</p></li><li><p>Editors (VS Code, LibreOffice)</p></li><li><p>Tools (GIMP, PDF viewers)</p><p>  ✔️ Ideal for isolated, disposable environments. Ideal for temporary, sandboxed tasks without cluttering your OS.</p></li></ul><h3>🌐 Web Dev &amp; Browser Testing</h3><p>Spin up clean browser instances in seconds for testing login flows, UI layouts, or performance.</p><pre><code>💡 Use multiple containers for parallel testing.</code></pre><h3>🤖 Selenium Testing</h3><p>Try our ready-to-use Selenium testing example:</p><ol><li><p>Navigate to the <a href=\"https://github.com/pgmystery/docker-extension-vnc/tree/main/examples/selenium\">/examples/selenium</a> directory</p></li><li><p>Follow the step-by-step guide in the README file to:</p><ul><li>Set up a Selenium Chrome container</li><li>Run automated browser tests</li><li>Watch the tests execute in real-time</li></ul><p> 🔍 Perfect for visual debugging of Selenium test suites</p></li></ol><h3>🔬 Malware or File Analysis (Safely)</h3><p>Open suspicious files in an isolated Linux environment.</p><pre><code>🔒 Just close the container to dispose of everything.</code></pre><h3>🛠️ GUI Debugging in Containers</h3><p>Run GUI debuggers or desktop editors inside a container.</p><pre><code>💻 Perfect for debugging GUI-based apps or editors (e.g. GDB GUI, VS Code Desktop) without leaving Docker.</code></pre><h3>📦 Legacy Software in CI/CD</h3><p>Use GUI-reliant tools in headless pipelines.</p><pre><code>🔁 Ideal for automated PDF/image generation or GUI testing.</code></pre><h3>🎓 Disposable Desktops for Training</h3><p>Provide ready-to-use Linux desktops for workshops, demos, or internal labs.</p><pre><code>🎓 Great for teaching Linux, Docker, or OSS tools.</code></pre><hr><h2>✨ Why Use This Extension?</h2><ul><li>✅ <strong>Zero Setup</strong> – Just launch from Docker Desktop</li><li>📦 <strong>Fully Containerized</strong> – Nothing installed on the host</li><li>🔒 <strong>Safe &amp; Isolated</strong> – Perfect for testing risky files</li><li>🔧 <strong>Customizable</strong> – Add your own Dockerfiles and tools</li></ul><hr><h2>🔧 Installation</h2><h3>📥 Install from Docker Marketplace</h3><blockquote><p>👉 <a href=\"https://open.docker.com/extensions/marketplace?extensionId=pgmystery/docker-extension-vnc\">Click here to install via Docker Desktop Marketplace</a></p></blockquote><h3>🛠️ Manual Installation</h3><pre><code class=\"language-bash\">docker extension install pgmystery/docker-extension-vnc:1.3.2</code></pre><hr><h2>🧪 Usage</h2><h3>▶️ Try the Example Container</h3><p>Click the <strong>&quot;Try example container&quot;</strong> button to launch a prebuilt <a href=\"https://hub.docker.com/r/pgmystery/ubuntu_vnc\">Ubuntu VNC image</a> with a desktop environment.</p><p><p><a href=\"https://raw.githubusercontent.com/pgmystery/docker-extension-vnc/refs/heads/main/docs/imgs/screenshot4.png\">Dashboard Screenshot Screenshot</a></p></p><hr><h3>🗂 Working with Sessions</h3><p>Sessions allow you to save and manage connection presets. Stored securely in a Docker volume via a backend container using SQLite.</p><p>To create a session:</p><ol><li>Click the ➕ icon</li><li>Fill out the form</li><li>Save and click <strong>Connect</strong></li></ol><p>Supported connection types:</p><ul><li><a href=\"#-connect-to-a-docker-container\">Docker Container</a></li><li><a href=\"#-run-from-a-docker-image\">Docker Image</a></li><li><a href=\"#-connect-to-a-remote-host\">Remote Host</a></li></ul><p><p><a href=\"https://raw.githubusercontent.com/pgmystery/docker-extension-vnc/refs/heads/main/docs/imgs/screenshot6.png\">Edit Session Screenshot</a></p></p><hr><h4>🐳 Connect to a Docker Container</h4><ol><li>Create a new session</li><li>Select <strong>Docker Container</strong></li><li>Choose a running container or enter its name/ID</li><li>Set the internal VNC port</li><li>(Optional) Enter credentials</li><li>Save and connect</li></ol><p><p><a href=\"https://raw.githubusercontent.com/pgmystery/docker-extension-vnc/refs/heads/main/docs/imgs/screenshot1.png\">Container Desktop Screenshot Screenshot</a></p></p><hr><h4>📦 Run from a Docker Image</h4><ol><li>Enter a unique Session name.</li><li>Choose <strong>Docker Image</strong> as the connection type.</li><li>Select a VNC-enabled Docker Image from the Docker-Hub or locally (e.g. <a href=\"https://hub.docker.com/r/selenium/standalone-chrome-debug\"><code>selenium/standalone-chrome-debug</code></a>).</li><li>Select the image tag.</li><li>(<em>Optional</em>) Add <a href=\"https://docs.docker.com/reference/cli/docker/container/run/#options\">Docker Run Options</a>.</li><li>(<em>Optional</em>) Specify a custom <a href=\"https://docs.docker.com/engine/containers/run/#commands-and-arguments\">Docker Run command with Args</a>.</li><li>Specify the VNC-Server port.</li><li>Choose whether to remove the Container after disconnecting or keep it alive.</li><li>(<em>Optional</em>) Enter the credentials for the VNC connection if you want to store them.</li><li>Save and connect</li></ol><hr><h4>🌍 Connect to a Remote Host</h4><ol><li>Enter a unique Session name.</li><li>Choose <strong>Remote Host</strong> as the connection type.</li><li>Enter the IP-Address of the remote host.</li><li>Specify the VNC-Server port.</li><li>(<em>Optional</em>) Enter the credentials for the VNC connection if you want to store them.</li><li>Save and connect</li></ol><p>Supports Linux, macOS, and Windows hosts.</p><p><p><a href=\"https://raw.githubusercontent.com/pgmystery/docker-extension-vnc/refs/heads/main/docs/imgs/screenshot8.png\">Remote Windows Screenshot</a></p><p><a href=\"https://raw.githubusercontent.com/pgmystery/docker-extension-vnc/refs/heads/main/docs/imgs/screenshot7.png\">Remote Linux Screenshot</a></p></p><hr><h2>📎 Related Links</h2><ul><li><a href=\"https://hub.docker.com/extensions/pgmystery/docker-extension-vnc\">Docker Extension on Docker Hub</a></li><li><a href=\"https://hub.docker.com/r/pgmystery/ubuntu_vnc\">Example Ubuntu VNC Image</a></li><li><a href=\"https://github.com/novnc/noVNC\">noVNC GitHub</a></li><li><a href=\"https://hub.docker.com/r/pgmystery/proxy_vnc\">Proxy Container</a></li></ul>" \
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
