ARG BASE_IMAGE="pgmystery/vnc-kali-base:latest"
FROM ${BASE_IMAGE}

USER root

# Install Kali Linux Large metapackage and KDE Desktop
RUN apt-get update && \
    apt-get install -y kali-linux-large kali-desktop-kde && \
    apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

USER vncuser
