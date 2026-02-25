ARG BASE_IMAGE="pgmystery/vnc-ubuntu-base:latest"
FROM ${BASE_IMAGE}

USER root

# Install Gnome-specific packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    gnome-session-flashback \
    gnome-flashback \
    metacity \
    gnome-panel \
    gnome-terminal \
    gnome-icon-theme \
    adwaita-icon-theme-full \
    ubuntu-wallpapers \
    gnome-backgrounds \
    ubuntu-settings \
    at-spi2-core \
    fonts-dejavu-core \
    fonts-liberation \
    fonts-ubuntu \
    fonts-ubuntu-console \
    fontconfig \
    dconf-cli \
    && fc-cache -f -v \
    && apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Create a dedicated session script to handle D-Bus and GNOME session startup
RUN printf '#!/bin/bash\n\
    if [ ! -s /run/dbus/system_bus_socket ]; then\n\
    sudo mkdir -p /run/dbus\n\
    sudo dbus-daemon --system --fork --nopidfile\n\
    fi\n\
    export XDG_CURRENT_DESKTOP="GNOME-Flashback:GNOME"\n\
    export GNOME_SHELL_SESSION_MODE="flashback"\n\
    # Wait for the session to start then enable desktop management\n\
    (sleep 5 && gsettings set org.gnome.gnome-flashback desktop true) &\n\
    exec gnome-session --session=gnome-flashback-metacity --disable-acceleration-check "$@"\n' > /usr/local/bin/gnome-vnc-session.sh && \
    chmod +x /usr/local/bin/gnome-vnc-session.sh

USER vncuser

# Set session command
# Use the dedicated script to ensure D-Bus is running before GNOME starts
CMD ["gnome-vnc-session.sh"]
