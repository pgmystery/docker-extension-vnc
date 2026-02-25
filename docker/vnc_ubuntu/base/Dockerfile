ARG BASE_IMAGE="pgmystery/vnc-ubuntu-base:audio-full"
FROM ${BASE_IMAGE}

USER root

# Remove Snap and install firefox via PPA
RUN apt-get update && apt-get install -y --no-install-recommends \
    software-properties-common \
    && apt remove --purge -y snapd && \
    add-apt-repository -y ppa:mozillateam/ppa && \
    echo 'Package: firefox*\nPin: release o=LP-PPA-mozillateam\nPin-Priority: 1001' > /etc/apt/preferences.d/mozilla-firefox && \
    apt-get update && apt-get install -y firefox && \
    apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

USER vncuser
