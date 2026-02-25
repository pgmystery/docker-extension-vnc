ARG BASE_IMAGE="pgmystery/vnc-ubuntu-base:latest"
FROM ${BASE_IMAGE}

USER root

# Fix some bugs
RUN mkdir -p /home/vncuser/.local/share/applications/
COPY ./usr/share/applications/caja.desktop /home/vncuser/.local/share/applications/caja.desktop
RUN chown -R vncuser:vncuser /home/vncuser/.local && chmod 0644 /home/vncuser/.local/share/applications/caja.desktop

# Install Mate-specific packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    ubuntu-mate-desktop \
    mate-applet-brisk-menu \
    mate-desktop-environment-core \
    mate-applets \
    mate-notification-daemon \
    mate-system-monitor \
    mate-utils \
    && apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

USER vncuser

# Set session command
CMD ["mate-session"]
