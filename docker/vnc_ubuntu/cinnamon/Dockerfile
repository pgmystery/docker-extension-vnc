# Use an official Ubuntu base image
FROM ubuntu:24.04

ENV VNC_PASSWORD="foobar"

# Avoid warnings by switching to noninteractive for the build process
ENV DEBIAN_FRONTEND=noninteractive

ENV USER=root

# Set display resolution (change as needed)
ENV RESOLUTION=1920x1080

# Set port of VNC Server
ENV PORT=5901

# Set Display env for dbus
ENV DISPLAY=:0.0

# Set default lang
ENV LANG="en_US.UTF-8"
ENV LC_ALL=$LANG

# Install locales and set it up
RUN apt-get update && apt-get install -y --no-install-recommends \
    && echo $LANG UTF-8 > /etc/locale.gen && \
    env DEBIAN_FRONTEND=noninteractive apt-get install -y \
      locales && \
    update-locale --reset LANG=$LANG \
    && apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Copy settings to avoid snap
COPY apt/preferences.d/ /etc/apt/preferences.d/
COPY apt/apt.conf.d/ /etc/apt/apt.conf.d/

# Install packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    cinnamon \
    gnome-terminal \
    tightvncpasswd  \
    tigervnc-common \
    tigervnc-standalone-server \
    dbus-x11 \
    gnome-icon-theme \
    software-properties-common

RUN apt remove --purge -y snapd
RUN add-apt-repository -y ppa:mozillateam/ppa \
    && apt update \
    && apt install -y firefox
RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Some cinnamon configs
RUN eval $(dbus-launch --sh-syntax) \
    && gsettings set org.nemo.preferences treat-root-as-normal true \
    && gsettings set org.cinnamon.desktop.background picture-uri "file:///usr/share/backgrounds/gnome/adwaita-l.jpg"

# Create .vnc directory
RUN mkdir /root/.vnc

# Create an .Xauthority file
RUN touch /root/.Xauthority

# Expose VNC port
EXPOSE $PORT

# Set the working directory in the container
WORKDIR /app

# Copy a script to start the VNC server
COPY start-vnc.sh start-vnc.sh
RUN chmod +x start-vnc.sh

ENTRYPOINT ["bash", "./start-vnc.sh"]
