ARG BASE_IMAGE="pgmystery/workstation-base:latest"
FROM ${BASE_IMAGE}

# Set NVM version
ENV NVM_VERSION=v0.40.4
ENV NVM_DIR=$HOME/.nvm

# Install NVM
RUN mkdir -p "$NVM_DIR"
RUN curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/${NVM_VERSION}/install.sh | bash

# Install Node.js LTS
RUN . "$NVM_DIR/nvm.sh" \
    && nvm install --lts \
    && nvm use --lts

# Install global tools including Puppeteer, Selenium and Selenium-standalone server
RUN npm install -g pnpm yarn typescript ts-node nodemon puppeteer selenium-webdriver selenium-standalone && \
    selenium-standalone install

USER root

# Install dependencies for Puppeteer and Selenium (browser automation)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libxcursor1 \
    libxi6 \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install WebStorm
RUN mkdir -p /opt/webstorm && \
    curl -L "https://download.jetbrains.com/webstorm/WebStorm-2023.3.4.tar.gz" | tar -xz -C /opt/webstorm --strip-components=1

# Create wrapper script for WebStorm to handle VNC/Sandbox
RUN echo '#!/bin/bash\n/opt/webstorm/bin/webstorm.sh "$@"' > /usr/local/bin/webstorm && \
    chmod +x /usr/local/bin/webstorm

# Add desktop shortcut for WebStorm
RUN mkdir -p /home/vncuser/Desktop && \
    echo '[Desktop Entry]\n\
    Version=1.0\n\
    Type=Application\n\
    Name=WebStorm\n\
    Icon=/opt/webstorm/bin/webstorm.svg\n\
    Exec=/usr/local/bin/webstorm\n\
    Comment=Powering JS development\n\
    Categories=Development;IDE;\n\
    Terminal=false' > /home/vncuser/Desktop/webstorm.desktop && \
    # Add Node.js CLI shortcut \
    echo '[Desktop Entry]\n\
    Version=1.0\n\
    Type=Application\n\
    Name=Node.js CLI\n\
    Comment=Run Node.js REPL\n\
    Exec=xfce4-terminal -e node\n\
    Icon=nodejs\n\
    Terminal=false' > /home/vncuser/Desktop/node.desktop && \
    # Add Selenium Server shortcut \
    echo '[Desktop Entry]\n\
    Version=1.0\n\
    Type=Application\n\
    Name=Selenium Server\n\
    Comment=Start Selenium Standalone Server\n\
    Exec=xfce4-terminal -H -e "selenium-standalone start"\n\
    Icon=web-browser\n\
    Terminal=false' > /home/vncuser/Desktop/selenium.desktop && \
    # Add Puppeteer / Chrome Host shortcut (for remote debugging) \
    echo '[Desktop Entry]\n\
    Version=1.0\n\
    Type=Application\n\
    Name=Puppeteer Chrome\n\
    Comment=Start Chrome with Remote Debugging (Port 9222)\n\
    Exec=xfce4-terminal -H -e "google-chrome --remote-debugging-port=9222 --no-sandbox --user-data-dir=/home/vncuser/.config/puppeteer-chrome"\n\
    Icon=google-chrome\n\
    Terminal=false' > /home/vncuser/Desktop/puppeteer.desktop && \
    chmod +x /home/vncuser/Desktop/*.desktop

# Final permissions fix
RUN chown -R vncuser:vncuser /home/vncuser /opt/webstorm

USER vncuser
