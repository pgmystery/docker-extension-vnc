ARG BASE_IMAGE="pgmystery/vnc-ubuntu-base:latest"
FROM ${BASE_IMAGE}

USER root

# Install Cinnamon-specific packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    cinnamon \
    gnome-terminal \
    gnome-icon-theme \
    && apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

USER vncuser

# Some cinnamon configs
RUN dbus-run-session gsettings set org.nemo.preferences treat-root-as-normal true \
    && dbus-run-session gsettings set org.cinnamon.desktop.background picture-uri "file:///usr/share/backgrounds/gnome/adwaita-l.jpg"

# Set session command
CMD ["cinnamon-session"]
