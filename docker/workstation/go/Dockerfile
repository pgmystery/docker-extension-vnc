ARG BASE_IMAGE="pgmystery/workstation-base:latest"
FROM ${BASE_IMAGE}

USER root

# Install Go
RUN apt-get update && apt-get install -y --no-install-recommends \
    golang-go \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install GoLand
RUN mkdir -p /opt/goland && \
    curl -L "https://download.jetbrains.com/go/goland-2023.3.4.tar.gz" | tar -xz -C /opt/goland --strip-components=1

# Create wrapper script for GoLand
RUN echo '#!/bin/bash\n/opt/goland/bin/goland.sh "$@"' > /usr/local/bin/goland && \
    chmod +x /usr/local/bin/goland

# Add desktop shortcut for GoLand
RUN mkdir -p /home/vncuser/Desktop && \
    echo '[Desktop Entry]\n\
    Version=1.0\n\
    Type=Application\n\
    Name=GoLand\n\
    Icon=/opt/goland/bin/goland.svg\n\
    Exec=/usr/local/bin/goland\n\
    Comment=The Drive to Go\n\
    Categories=Development;IDE;Go;\n\
    Terminal=false' > /home/vncuser/Desktop/goland.desktop && \
    chmod +x /home/vncuser/Desktop/goland.desktop && \
    chown -R vncuser:vncuser /home/vncuser/Desktop /opt/goland

USER vncuser
