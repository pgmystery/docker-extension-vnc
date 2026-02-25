ARG BASE_IMAGE="pgmystery/vnc-ubuntu-base:latest"
FROM ${BASE_IMAGE}

USER root

# Install LXQT-specific packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    lxqt \
    gvfs \
    && apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Setup lxqt
USER vncuser
COPY --chown=vncuser:vncuser ./.config/lxqt/lxqt.conf /home/vncuser/.config/lxqt/lxqt.conf
RUN chmod 0644 /home/vncuser/.config/lxqt/lxqt.conf

# Set session command
CMD ["startlxqt"]
