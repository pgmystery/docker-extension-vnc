ARG BASE_IMAGE="pgmystery/vnc-ubuntu-base:latest"
FROM ${BASE_IMAGE}

USER root

# Install LXDE-specific packages and remove lxpolkit to avoid session errors in Docker
RUN apt-get update && apt-get install -y --no-install-recommends \
    lxde \
    dbus-x11 \
    dos2unix \
    x11-utils \
    x11-xserver-utils \
    libfm-modules \
    && rm -f /usr/bin/lxpolkit \
    && apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Fix issue: https://askubuntu.com/a/1520459
USER root
RUN mkdir -p /etc/xdg/lxpanel/LXDE/panels
COPY ./.config/lxpanel/LXDE/panels/panel /etc/xdg/lxpanel/LXDE/panels/panel

USER vncuser
RUN mkdir -p /home/vncuser/.config/lxpanel/LXDE/panels \
    && mkdir -p /home/vncuser/.config/lxpanel/default/panels
COPY --chown=vncuser:vncuser ./.config/lxpanel/LXDE/panels/panel /home/vncuser/.config/lxpanel/LXDE/panels/panel
COPY --chown=vncuser:vncuser ./.config/lxpanel/LXDE/panels/panel /home/vncuser/.config/lxpanel/default/panels/panel

# Sanitize all config files (remove Windows CRLF)
USER root
RUN find /home/vncuser/.config -type f -exec dos2unix {} + \
    && find /etc/xdg/lxpanel -type f -exec dos2unix {} +

USER vncuser
RUN chmod -R 755 /home/vncuser/.config

ENV XDG_MENU_PREFIX="lxde-"

# Set session command
CMD ["startlxde"]
