FROM ubuntu:24.04

ENV VNC_PASSWORD="foobar"
ENV DEBIAN_FRONTEND=noninteractive
ENV USER=root
ENV RESOLUTION=1920x1080
ENV PORT=5901
ENV DISPLAY=:0.0
ENV LANG="en_US.UTF-8"
ENV LC_ALL=$LANG
ENV XDG_RUNTIME_DIR=/tmp/runtime
ENV PIPEWIRE_RUNTIME_DIR=/tmp/runtime

ENV VNC_EXTENSION_AUDIO_OUTPUT=true
ENV VNC_EXTENSION_AUDIO_INPUT=true

# Set up locale
RUN apt-get update && apt-get install -y --no-install-recommends \
    locales && \
    echo $LANG UTF-8 > /etc/locale.gen && locale-gen && update-locale LANG=$LANG && \
    apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Copy settings to avoid snap
COPY apt/preferences.d/ /etc/apt/preferences.d/
COPY apt/apt.conf.d/ /etc/apt/apt.conf.d/

# Install necessary packages
RUN apt-get update && dpkg --configure -a && apt-get install -y --no-install-recommends \
    tightvncpasswd \
    tigervnc-common \
    tigervnc-standalone-server \
    dbus-x11 \
    software-properties-common \
    xfce4 \
    xfce4-goodies \
    fonts-noto-cjk fonts-ipafont-gothic fonts-ipafont-mincho \
    pulseaudio \
    pulseaudio-utils \
    ffmpeg \
    pavucontrol \
    audacity \
    iputils-ping \
    dnsutils \
    && apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Force PulseAudio to allow root and disable SHM (shared memory)
# which often fails in Docker
RUN sed -i 's/; daemonize = no/daemonize = yes/' /etc/pulse/daemon.conf && \
    sed -i 's/; allow-exit = yes/allow-exit = no/' /etc/pulse/daemon.conf && \
    sed -i 's/; default-fragments = .*/default-fragments = 2/' /etc/pulse/daemon.conf && \
    sed -i 's/; default-fragment-size-msec = .*/default-fragment-size-msec = 10/' /etc/pulse/daemon.conf && \
    sed -i 's/; enable-shm = yes/enable-shm = no/' /etc/pulse/daemon.conf

# Create pulse user/group for system-mode compatibility
# RUN usermod -aG pulse-access root

# Config
COPY ./.config/xfce4/xfconf/xfce-perchannel-xml/xfce4-desktop.xml /root/.config/xfce4/xfconf/xfce-perchannel-xml/xfce4-desktop.xml
RUN chmod 0644 /root/.config/xfce4/xfconf/xfce-perchannel-xml/xfce4-desktop.xml

# Remove Snap and install firefox
RUN apt remove --purge -y snapd
RUN add-apt-repository -y ppa:mozillateam/ppa \
    && apt update \
    && apt install -y firefox

# Clean apt caches
RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Create .vnc and runtime directories
RUN mkdir -p /root/.vnc /tmp/runtime && chmod 700 /tmp/runtime

# Create .Xauthority
RUN touch /root/.Xauthority

# Expose VNC and audio TCP port
EXPOSE $PORT
EXPOSE 7900

# Set working directory
WORKDIR /app

# Copy start script
COPY start-vnc.sh start-vnc.sh
RUN chmod +x start-vnc.sh

# Entry point
ENTRYPOINT ["bash", "./start-vnc.sh"]
