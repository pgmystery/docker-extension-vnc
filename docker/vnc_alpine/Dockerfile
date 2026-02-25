FROM alpine:3.23.3

ENV RESOLUTION=1280x720
ENV PORT=5901
ENV DISPLAY=:0.0

# Install TigerVNC, Fluxbox and essential fonts
RUN apk add --no-interactive --no-cache \
    tigervnc \
    fluxbox \
    xterm \
    font-cursor-misc \
    font-misc-misc \
    font-alias \
    font-schumacher-misc \
    xset \
    sudo \
    curl \
    ca-certificates \
    && addgroup -S vncuser && adduser -S vncuser -G vncuser \
    && echo "vncuser ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/vncuser

# Pre-create X11 socket directory and set permissions
RUN mkdir -p /tmp/.X11-unix && chmod 1777 /tmp/.X11-unix

WORKDIR /app

# Copy start script
COPY start-vnc.sh /usr/local/bin/start-vnc.sh
RUN chmod +x /usr/local/bin/start-vnc.sh

USER vncuser
ENV HOME=/home/vncuser

EXPOSE $PORT

ENTRYPOINT ["/usr/local/bin/start-vnc.sh"]
