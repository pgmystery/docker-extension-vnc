ARG BASE_IMAGE="pgmystery/workstation-base:latest"
FROM ${BASE_IMAGE}

USER root

# Install Java 21, Maven, and Gradle
RUN apt-get update && apt-get install -y --no-install-recommends \
    openjdk-21-jdk \
    maven \
    gradle \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Set JAVA_HOME
ENV JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
ENV PATH=$JAVA_HOME/bin:$PATH

# Install IntelliJ IDEA Ultimate
RUN mkdir -p /opt/intellij && \
    curl -L "https://download.jetbrains.com/idea/ideaIU-2023.3.4.tar.gz" | tar -xz -C /opt/intellij --strip-components=1

# Create wrapper script for IntelliJ
RUN echo '#!/bin/bash\n/opt/intellij/bin/idea.sh "$@"' > /usr/local/bin/idea && \
    chmod +x /usr/local/bin/idea

# Add desktop shortcut for IntelliJ
RUN mkdir -p /home/vncuser/Desktop && \
    echo '[Desktop Entry]\n\
    Version=1.0\n\
    Type=Application\n\
    Name=IntelliJ IDEA\n\
    Icon=/opt/intellij/bin/idea.svg\n\
    Exec=/usr/local/bin/idea\n\
    Comment=Capable and Ergonomic IDE for JVM\n\
    Categories=Development;IDE;Java;\n\
    Terminal=false' > /home/vncuser/Desktop/intellij.desktop && \
    chmod +x /home/vncuser/Desktop/intellij.desktop && \
    chown -R vncuser:vncuser /home/vncuser/Desktop /opt/intellij

USER vncuser
