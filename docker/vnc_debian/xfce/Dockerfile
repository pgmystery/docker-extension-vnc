ARG BASE_IMAGE="pgmystery/vnc-debian-base"
FROM ${BASE_IMAGE}

USER root

# Install XFCE-specific packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    xfce4 \
    xfce4-goodies \
    && apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Config
USER vncuser
COPY --chown=vncuser:vncuser .config/xfce4/xfconf/xfce-perchannel-xml/xfce4-desktop.xml /home/vncuser/.config/xfce4/xfconf/xfce-perchannel-xml/xfce4-desktop.xml
RUN chmod 0644 /home/vncuser/.config/xfce4/xfconf/xfce-perchannel-xml/xfce4-desktop.xml

# Set session command
CMD ["startxfce4"]
