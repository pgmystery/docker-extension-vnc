ARG BASE_IMAGE="pgmystery/workstation-base:latest"
FROM ${BASE_IMAGE}

USER root

# Install Python and common tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-venv \
    python-is-python3 \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install uv, poetry, and other tools
RUN curl -LsSf https://astral.sh/uv/install.sh | sh \
    && curl -sSL https://install.python-poetry.org | python3 -

# Add poetry and uv to PATH
ENV PATH="/root/.local/bin:$PATH"

# Install jupyterlab and formatting tools via pip (global for simplicity in base image)
RUN pip install --no-cache-dir jupyterlab black flake8

# Set up tools for vncuser
USER vncuser
RUN curl -LsSf https://astral.sh/uv/install.sh | sh \
    && curl -sSL https://install.python-poetry.org | python3 -
ENV PATH="/home/vncuser/.local/bin:$PATH"

# Install PyCharm Professional
RUN mkdir -p /opt/pycharm && \
    curl -L "https://download.jetbrains.com/python/pycharm-professional-2023.3.4.tar.gz" | tar -xz -C /opt/pycharm --strip-components=1

# Create wrapper script for PyCharm
RUN echo '#!/bin/bash\n/opt/pycharm/bin/pycharm.sh "$@"' > /usr/local/bin/pycharm && \
    chmod +x /usr/local/bin/pycharm

# Add desktop shortcuts for PyCharm and Python
RUN mkdir -p /home/vncuser/Desktop && \
    echo '[Desktop Entry]\n\
    Version=1.0\n\
    Type=Application\n\
    Name=PyCharm\n\
    Icon=/opt/pycharm/bin/pycharm.svg\n\
    Exec=/usr/local/bin/pycharm\n\
    Comment=Python IDE for Professional Developers\n\
    Categories=Development;IDE;Python;\n\
    Terminal=false' > /home/vncuser/Desktop/pycharm.desktop && \
    echo '[Desktop Entry]\n\
    Version=1.0\n\
    Type=Application\n\
    Name=Python\n\
    Comment=Run Python REPL\n\
    Exec=xfce4-terminal -e python3\n\
    Icon=python3\n\
    Terminal=false' > /home/vncuser/Desktop/python.desktop && \
    chmod +x /home/vncuser/Desktop/*.desktop && \
    chown -R vncuser:vncuser /home/vncuser/Desktop /opt/pycharm

USER vncuser
