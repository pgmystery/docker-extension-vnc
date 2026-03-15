FROM debian:stable-slim

ENV DEBIAN_FRONTEND=noninteractive
ENV LANG="en_US.UTF-8"
ENV LC_ALL=$LANG
ENV RESOLUTION=1920x1080
ENV PORT=5901
ENV DISPLAY=:0.0
ENV XDG_RUNTIME_DIR=/tmp/runtime
ENV PIPEWIRE_RUNTIME_DIR=/tmp/runtime
ENV VNC_EXTENSION_AUDIO_OUTPUT=true
ENV VNC_EXTENSION_AUDIO_INPUT=true

# Set up locale
RUN apt-get update && apt-get install -y --no-install-recommends \
    locales \
    sudo \
    curl \
    vim \
    ca-certificates \
    && echo $LANG UTF-8 > /etc/locale.gen && locale-gen && update-locale LANG=$LANG \
    && apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Add non-root user
RUN useradd -m -s /bin/bash vncuser && \
    echo "vncuser ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/vncuser

# Install common VNC and audio dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    tightvncpasswd \
    tigervnc-common \
    tigervnc-standalone-server \
    dbus-x11 \
    fonts-noto-cjk fonts-ipafont-gothic fonts-ipafont-mincho \
    pulseaudio \
    pulseaudio-utils \
    ffmpeg \
    pavucontrol \
    iputils-ping \
    dnsutils \
    && apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Force PulseAudio to allow root (and non-root) and disable SHM
RUN sed -i 's/; daemonize = no/daemonize = yes/' /etc/pulse/daemon.conf && \
    sed -i 's/; allow-exit = yes/allow-exit = no/' /etc/pulse/daemon.conf && \
    sed -i 's/; default-fragments = .*/default-fragments = 2/' /etc/pulse/daemon.conf && \
    sed -i 's/; default-fragment-size-msec = .*/default-fragment-size-msec = 10/' /etc/pulse/daemon.conf && \
    sed -i 's/; enable-shm = yes/enable-shm = no/' /etc/pulse/daemon.conf

# Install Firefox-ESR (Debian standard)
RUN apt-get update && apt-get install -y --no-install-recommends \
    firefox-esr \
    && apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Create runtime directory
RUN mkdir -p /tmp/runtime && chmod 777 /tmp/runtime

# Set working directory
WORKDIR /app

# Copy start script
COPY vnc_common/start-vnc.sh /usr/local/bin/start-vnc.sh
RUN chmod +x /usr/local/bin/start-vnc.sh

USER vncuser
ENV HOME=/home/vncuser

# Create .vnc, .config/tigervnc and .Xauthority
RUN mkdir -p $HOME/.vnc $HOME/.config/tigervnc && touch $HOME/.Xauthority

EXPOSE $PORT
EXPOSE 7900

ENTRYPOINT ["/usr/local/bin/start-vnc.sh"]
