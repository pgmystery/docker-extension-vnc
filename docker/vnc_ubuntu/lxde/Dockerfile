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

RUN dpkg --configure -a

# Install necessary packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    tightvncpasswd  \
    tigervnc-common \
    tigervnc-standalone-server \
    dbus-x11 \
    software-properties-common

# Install desktop
RUN apt-get update && apt-get install -y --no-install-recommends \
    lxde

# Fix issue: https://askubuntu.com/a/1520459
COPY ./.config/lxpanel/LXDE/panels/panel /root/.config/lxpanel/LXDE/panels/panel
RUN chmod 0644 /root/.config/lxpanel/LXDE/panels/panel

# Clean apt caches
RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

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
