# Proxy VNC

## Description

This Docker Image is part of the project [docker-extension-vnc](https://github.com/pgmystery/docker-extension-vnc).

It is using [noVNC](https://github.com/novnc/noVNC), [websockify](https://github.com/novnc/websockify) and [mediamtx](https://github.com/bluenviron/mediamtx) to provide a VNC Proxy.


## Build Variables

| Build-Variable          | Default | Description                                                       |
|-------------------------|---------|-------------------------------------------------------------------|
| `NOVNC_VERSION`         | v1.6.0  | The version of [noVNC](https://github.com/novnc/noVNC).           |
| `WEBSOCKIFY_VERSION`    | v0.13.0 | The version of [websockify](https://github.com/novnc/websockify). |
| `MEDIAMTX_VERSION`      | 1.16.3  | The version of [mediamtx](https://github.com/bluenviron/mediamtx).   |


## Environment Variables

| Environment-Variable         | Default | Description                           |
|------------------------------|---------|---------------------------------------|
| `NOVNC_LISTEN_HOST`          | 0.0.0.0 | The listening interface of the Proxy. |
| `NOVNC_LISTEN_PORT`          | 6081    | The listening Port of the Proxy.      |
| `NOVNC_REMOTE_SERVER`        |         | The remote VNC Server.                |
| `MTX_PATHS_VNC_SOURCE`       |         | For starting the MediaMTX Server      |
| `VNC_EXTENSION_AUDIO_INPUT`  |         | For starting the MediaMTX Server      |
| `VNC_EXTENSION_AUDIO_OUTPUT` |         | For starting the MediaMTX Server      |


## Build Command

```bash
docker build -t pgmystery/proxy_vnc:latest .
```
