ARG BASE_IMAGE="pgmystery/vnc-kali-base:latest"
FROM ${BASE_IMAGE}

USER root

# Copy config files
USER vncuser
COPY --chown=vncuser:vncuser ./config/root/ /home/vncuser/

# Install packages and fix permissions in one layer
USER root
RUN apt-get update && \
    apt-get install -y kali-linux-headless xterm fluxbox && \
    # Fix line endings and permissions for fluxbox startup \
    sed -i 's/\r$//' /home/vncuser/.fluxbox/startup && \
    chmod +x /home/vncuser/.fluxbox/startup && \
    # Cleanup \
    apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

USER vncuser

# Set session command
CMD ["startfluxbox"]
