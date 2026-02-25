ARG BASE_IMAGE="pgmystery/vnc-ubuntu-base:core"
FROM ${BASE_IMAGE}

USER root

# Install audio input specific packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    pulseaudio \
    pulseaudio-utils \
    ffmpeg \
    pavucontrol \
    && apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Configure PulseAudio for low latency and stability
RUN sed -i 's/; daemonize = no/daemonize = yes/' /etc/pulse/daemon.conf && \
    sed -i 's/; allow-exit = yes/allow-exit = no/' /etc/pulse/daemon.conf && \
    sed -i 's/; default-fragments = .*/default-fragments = 2/' /etc/pulse/daemon.conf && \
    sed -i 's/; default-fragment-size-msec = .*/default-fragment-size-msec = 10/' /etc/pulse/daemon.conf && \
    sed -i 's/; enable-shm = yes/enable-shm = no/' /etc/pulse/daemon.conf

USER vncuser

ENV VNC_EXTENSION_AUDIO_OUTPUT=false
ENV VNC_EXTENSION_AUDIO_INPUT=true
