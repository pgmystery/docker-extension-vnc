ARG BASE_IMAGE="pgmystery/workstation-base:latest"
FROM ${BASE_IMAGE}

USER root

# Install Node.js LTS (20.x)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Python
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-venv \
    python-is-python3 \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install DB Clients and Docker CLI
RUN apt-get update && apt-get install -y --no-install-recommends \
    postgresql-client \
    redis-tools \
    mongodb-clients \
    docker.io \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install global node tools
RUN npm install -g pnpm yarn typescript

USER vncuser
