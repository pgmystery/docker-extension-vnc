# Kali Linux VNC Desktop/Server Images

This directory contains the Kali Linux-based VNC suite. It uses `kalilinux/kali-last-release` as the base image and provides two main variants: Headless (core tools) and Large (extensive tools).

## Images

- **Base Image**: `pgmystery/vnc-kali-base:latest` (Contains VNC, Audio, and base Kali system)
- **Headless Image**: `pgmystery/kali_vnc:headless` (Kali Linux with `kali-linux-headless` metapackage)
- **Large Image**: `pgmystery/kali_vnc:large` (Kali Linux with KDE Plasma and `kali-linux-large`)

## How to Build

### Using the Makefile (Recommended)
We provide a [Makefile](./Makefile) to automate the build process.

```bash
# Build base, headless and large
make all

# Build only the base image
make base

# Build only the headless image
make headless

# Build only the large image
make large
```

### Manual Build (Alternative)
```bash
# Build base
docker build -t pgmystery/vnc-kali-base:latest -f base/Dockerfile ..

# Build headless
docker build -t pgmystery/kali_vnc:headless ./headless

# Build large
docker build -t pgmystery/kali_vnc:large ./large
```

## How to Use

Run a container:
```bash
docker run -d -p 5901:5901 -e VNC_PASSWORD=mysecret pgmystery/kali_vnc:headless
```

Connect using any VNC client to `localhost:5901`.
