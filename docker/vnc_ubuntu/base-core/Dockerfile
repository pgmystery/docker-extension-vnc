FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive \
    LANG=en_US.UTF-8 \
    LC_ALL=en_US.UTF-8 \
    RESOLUTION=1920x1080 \
    PORT=5901 \
    DISPLAY=:0.0 \
    XDG_RUNTIME_DIR=/tmp/runtime \
    VNC_EXTENSION_AUDIO_OUTPUT=false \
    VNC_EXTENSION_AUDIO_INPUT=false

# Everything in one layer for maximum compression/minimal footprint
RUN apt-get update && \
    # 1. Skip heavy documentation/manpages \
    printf 'path-exclude /usr/share/doc/*\npath-exclude /usr/share/man/*\npath-exclude /usr/share/info/*\npath-exclude /usr/share/lintian/*\n' > /etc/dpkg/dpkg.cfg.d/01_nodoc && \
    # 2. Install everything (including CJK fonts) \
    apt-get install -y --no-install-recommends \
    locales sudo curl ca-certificates \
    tightvncpasswd tigervnc-common tigervnc-standalone-server \
    dbus-x11 \
    fonts-wqy-microhei fonts-ipafont-gothic fonts-ipafont-mincho \
    iputils-ping dnsutils \
    && echo "en_US.UTF-8 UTF-8" > /etc/locale.gen && locale-gen \
    # 3. Aggressive cleanup in the SAME layer \
    && apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Add non-root user
RUN useradd -m -s /bin/bash vncuser && \
    echo "vncuser ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/vncuser

RUN mkdir -p /tmp/runtime && chmod 777 /tmp/runtime
WORKDIR /app

COPY vnc_common/start-vnc.sh /usr/local/bin/start-vnc.sh
RUN chmod +x /usr/local/bin/start-vnc.sh

USER vncuser
ENV HOME=/home/vncuser
RUN mkdir -p $HOME/.vnc && touch $HOME/.Xauthority

EXPOSE $PORT
EXPOSE 7900

ENTRYPOINT ["/usr/local/bin/start-vnc.sh"]
