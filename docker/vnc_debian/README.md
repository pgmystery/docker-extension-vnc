# Debian VNC Desktop/Server Images

This directory contains the Debian-based VNC suite. Unlike the Ubuntu suite, this is kept simple with a single all-in-one base image.

## Images

- **Base Image**: `pgmystery/vnc-debian-base:latest` (Contains VNC, Audio, and Firefox-ESR)
- **Distro Image**: `pgmystery/debian_xfce:xfce`

## How to Build

### Using the Makefile (Recommended)
We provide a [Makefile](./Makefile) to automate the build process.

```bash
# Build both base and xfce
make all

# Build only the base image
make base

# Build only the xfce image
make xfce
```

### Manual Build (Alternative)
```bash
# Build base
docker build -t pgmystery/vnc-debian-base:latest ./base

# Build xfce
docker build -t pgmystery/debian_xfce:xfce ./xfce
```

## How to Use

Run a container:
```bash
docker run -d -p 5901:5901 -e VNC_PASSWORD=mysecret pgmystery/debian_xfce:xfce
```

Connect using any VNC client to `localhost:5901`.
