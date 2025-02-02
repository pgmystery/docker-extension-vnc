FROM ubuntu:24.04

# Avoid warnings by switching to noninteractive for the build process
ENV DEBIAN_FRONTEND=noninteractive

ENV VNC_PASSWORD="foobar"
# Set display resolution (change as needed)
ENV RESOLUTION=640x480
# Set port of VNC Server
ENV PORT=5901

RUN apt-get update && apt-get install -y --no-install-recommends \
    xterm \
    tightvncpasswd \
    tigervnc-standalone-server \
    && apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

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
