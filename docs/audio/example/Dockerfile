FROM ubuntu:24.04

# Run as root to install packages
USER root

# Install required dependencies for desktop, VNC, and Audio
RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    # Basic desktop environment and VNC server \
    xfce4 \
    xfce4-terminal \
    tigervnc-standalone-server \
    # Audio dependencies \
    pulseaudio \
    pulseaudio-utils \
    ffmpeg \
    # Misc utilities \
    ca-certificates \
    curl \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Create a non-root user for running the container
RUN useradd -m -s /bin/bash vncuser && \
    mkdir -p /home/vncuser/.vnc ~/.config/pulse && \
    chown -R vncuser:vncuser /home/vncuser

# Switch to the non-root user
USER vncuser
WORKDIR /home/vncuser

# Set environment variables to enable audio features in the VNC Extension
ENV VNC_EXTENSION_AUDIO_OUTPUT=true
ENV VNC_EXTENSION_AUDIO_INPUT=true

# Copy the custom startup script that handles audio initialization
COPY --chown=vncuser:vncuser start.sh /home/vncuser/start.sh
RUN chmod +x /home/vncuser/start.sh

# Expose VNC port
EXPOSE 5901

# Run the startup script
CMD ["/home/vncuser/start.sh"]
