# Ubuntu VNC Desktop/Server Images

This directory contains a modular suite of Ubuntu-based VNC images with customizable audio and application layers.

## Modular Base Images

All modular images are consolidated in the repository: `pgmystery/vnc-ubuntu-base`

| Tag | Description | Size | Audio | Firefox |
| :--- | :--- | :--- | :--- | :--- |
| `:core` | Absolute minimum VNC environment | ~200MB | ❌ | ❌ |
| `:audio-out` | Core + Audio Output streaming | ~400MB | Output Only | ❌ |
| `:audio-in` | Core + Audio Input streaming | ~400MB | Input Only | ❌ |
| `:audio-full` | Core + Both Audio In and Out | ~400MB | In/Out | ❌ |
| `:latest` | Full developer base (Audio + Firefox) | ~1GB | In/Out | ✅ |

## Distro Images

These images build upon the base variants above. By default, most use `:latest` unless specified.

- [Xfce](./xfce) `:latest`
- [Cinnamon](./cinnamon) `:latest`
- [MATE](./mate) `:latest`
- [KDE-Plasma](./kde-plasma) `:latest`
- [LXDE](./lxde) `:latest`
- [LXQT](./lxqt) `:latest`
- [xTerm](./xterm) `:core` (Ultra-Minimal)

## How to Build

### Using the Makefile (Recommended)
We provide a [Makefile](./Makefile) to automate the build process.

```bash
# Build all base images and all distros
make all

# Build only the modular bases
make bases

# Build a specific base variant
make core
make audio-out

# Build a specific distro
make xfce
make xterm
```

### Manual Build (Alternative)
#### 1. Build a Base Variant
```bash
# Example: Build the core base
docker build -t pgmystery/vnc-ubuntu-base:core ./base-core
```

### 2. Build a Distro Image
```bash
# Example: Build xfce using the full base
docker build -t pgmystery/ubuntu_vnc:xfce ./xfce --build-arg BASE_IMAGE=pgmystery/vnc-ubuntu-base:latest
```

## How to Use

Run a container:
```bash
docker run -d -p 5901:5901 -e VNC_PASSWORD=mysecret pgmystery/ubuntu_vnc:xfce
```

Connect using any VNC client (e.g., TigerVNC, RealVNC) to `localhost:5901`.

## Customization

The shared [start-vnc.sh](../vnc_common/start-vnc.sh) automatically detects if PulseAudio or FFmpeg are installed. If you create your own custom Dockerfile building on `:core`, you don't even need to worry about the startup logic—it will "just work" based on what you `apt-get install`.
