# Use an official Ubuntu base image
FROM ubuntu:24.10

ENV VNC_PASSWORD="foobar"

# Avoid warnings by switching to noninteractive for the build process
ENV DEBIAN_FRONTEND=noninteractive

ENV USER=root

# Set display resolution (change as needed)
ENV RESOLUTION=1920x1080

# Set port of VNC Server
ENV PORT=5901

COPY apt/preferences.d/ /etc/apt/preferences.d/
COPY apt/apt.conf.d/ /etc/apt/apt.conf.d/

# Install XFCE, VNC server, dbus-x11, and xfonts-base
RUN apt-get update && apt-get install -y --no-install-recommends \
    xfce4 \
    xfce4-goodies \
    dbus-x11 \
    xfonts-base \
    software-properties-common \
    tightvncpasswd  \
    tigervnc-common \
    tigervnc-standalone-server

RUN apt remove --purge -y snapd
RUN add-apt-repository -y ppa:mozillateam/ppa \
    && apt update \
    && apt install -y firefox
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
