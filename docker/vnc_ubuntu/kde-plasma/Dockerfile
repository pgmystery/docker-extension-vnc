ARG BASE_IMAGE="pgmystery/vnc-ubuntu-base:latest"
FROM ${BASE_IMAGE}

USER root

# Install KDE-specific packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    kde-plasma-desktop \
    kubuntu-desktop \
    plasma-discover \
    && apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

USER vncuser

# KDE specific config
RUN kwriteconfig5 --file ~/.config/kdeglobals --group General --key BrowserApplication "firefox.desktop"

# Set session command
CMD ["startplasma-x11"]
