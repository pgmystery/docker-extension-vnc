ARG BASE_IMAGE="pgmystery/workstation-base:latest"
FROM ${BASE_IMAGE}

USER root

# Install dependencies for rustup
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install RustRover
RUN mkdir -p /opt/rustrover && \
    curl -L "https://download.jetbrains.com/rustrover/RustRover-2023.3.4.tar.gz" | tar -xz -C /opt/rustrover --strip-components=1

# Create wrapper script for RustRover
RUN echo '#!/bin/bash\n/opt/rustrover/bin/rustrover.sh "$@"' > /usr/local/bin/rustrover && \
    chmod +x /usr/local/bin/rustrover

# Add desktop shortcut for RustRover
RUN mkdir -p /home/vncuser/Desktop && \
    echo '[Desktop Entry]\n\
    Version=1.0\n\
    Type=Application\n\
    Name=RustRover\n\
    Icon=/opt/rustrover/bin/rustrover.svg\n\
    Exec=/usr/local/bin/rustrover\n\
    Comment=Focus on Your Code, Leave the Rest to Us\n\
    Categories=Development;IDE;Rust;\n\
    Terminal=false' > /home/vncuser/Desktop/rustrover.desktop && \
    chmod +x /home/vncuser/Desktop/rustrover.desktop && \
    chown -R vncuser:vncuser /home/vncuser/Desktop /opt/rustrover

USER vncuser
# Install rustup for vncuser
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/home/vncuser/.cargo/bin:$PATH"
