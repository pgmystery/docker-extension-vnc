FROM pgmystery/ubuntu_vnc:xfce

USER root

# Install common development tools and network tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    wget \
    git \
    vim \
    nano \
    htop \
    tmux \
    unzip \
    zip \
    build-essential \
    ca-certificates \
    sudo \
    iputils-ping \
    net-tools \
    dnsutils \
    iproute2 \
    traceroute \
    audacity \
    xarchiver \
    unrar \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install VS Code
RUN wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > packages.microsoft.gpg \
    && install -D -o root -g root -m 644 packages.microsoft.gpg /etc/apt/keyrings/packages.microsoft.gpg \
    && echo "deb [arch=amd64,arm64,armhf signed-by=/etc/apt/keyrings/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main" > /etc/apt/sources.list.d/vscode.list \
    && rm -f packages.microsoft.gpg \
    && apt-get update && apt-get install -y code \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Google Chrome and additional libraries for VS Code/Electron
RUN wget -q https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb \
    && apt-get update && apt-get install -y ./google-chrome-stable_current_amd64.deb \
    libgbm1 \
    libasound2t64 \
    libnss3 \
    libxss1 \
    libxtst6 \
    libcanberra-gtk-module \
    libcanberra-gtk3-module \
    && rm google-chrome-stable_current_amd64.deb \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Ensure vncuser exists
RUN id -u vncuser >/dev/null 2>&1 || (useradd -m -s /bin/bash vncuser && echo "vncuser ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/vncuser)

# Suppress VS Code WSL prompt and fix startup
ENV DONT_PROMPT_WSL_INSTALL=1

# Create a wrapper for VS Code and Google Chrome to always use recommended flags in Docker
RUN mv /usr/bin/code /usr/bin/code.real && \
    echo '#!/bin/bash\n/usr/bin/code.real --no-sandbox --disable-gpu --user-data-dir=/home/vncuser/.config/Code "$@"' > /usr/local/bin/code && \
    chmod +x /usr/local/bin/code

RUN echo '#!/bin/bash\n/usr/bin/google-chrome-stable --no-sandbox --disable-gpu --disable-dev-shm-usage "$@"' > /usr/local/bin/google-chrome && \
    chmod +x /usr/local/bin/google-chrome

# Update desktop entries to use wrappers
RUN if [ -f /usr/share/applications/code.desktop ]; then \
    sed -i 's|Exec=/usr/bin/code|Exec=/usr/local/bin/code|g' /usr/share/applications/code.desktop; \
    sed -i 's|Exec=/usr/share/code/code|Exec=/usr/local/bin/code|g' /usr/share/applications/code.desktop; \
    fi && \
    if [ -f /usr/share/applications/google-chrome.desktop ]; then \
    sed -i 's|Exec=/usr/bin/google-chrome-stable|Exec=/usr/local/bin/google-chrome|g' /usr/share/applications/google-chrome.desktop; \
    fi

# Set Chrome as default browser
RUN update-alternatives --install /usr/bin/x-www-browser x-www-browser /usr/local/bin/google-chrome 100 && \
    update-alternatives --set x-www-browser /usr/local/bin/google-chrome && \
    update-alternatives --install /usr/bin/gnome-www-browser gnome-www-browser /usr/local/bin/google-chrome 100 && \
    update-alternatives --set gnome-www-browser /usr/local/bin/google-chrome

# XFCE default browser setting for vncuser
RUN mkdir -p /home/vncuser/.config/xfce4 && \
    echo "WebBrowser=google-chrome" > /home/vncuser/.config/xfce4/helpers.rc && \
    chown -R vncuser:vncuser /home/vncuser/.config/xfce4

# Fix permissions for vncuser and add desktop shortcuts
RUN mkdir -p /home/vncuser/.config /home/vncuser/Desktop && \
    # Create desktop shortcuts by copying from /usr/share/applications \
    if [ -f /usr/share/applications/code.desktop ]; then cp /usr/share/applications/code.desktop /home/vncuser/Desktop/; fi && \
    if [ -f /usr/share/applications/google-chrome.desktop ]; then cp /usr/share/applications/google-chrome.desktop /home/vncuser/Desktop/; fi && \
    if [ -f /usr/share/applications/xfce4-terminal.desktop ]; then cp /usr/share/applications/xfce4-terminal.desktop /home/vncuser/Desktop/; fi && \
    # Make them executable (required for XFCE desktop) \
    chmod +x /home/vncuser/Desktop/*.desktop || true && \
    chown -R vncuser:vncuser /home/vncuser

USER vncuser
