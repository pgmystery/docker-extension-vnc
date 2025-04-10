# Proxy VNC

## Description

This Docker Image is part of the project [docker-extension-vnc](https://github.com/pgmystery/docker-extension-vnc).

It is using [noVNC](https://github.com/novnc/noVNC) and [websockify](https://github.com/novnc/websockify).


## Build Variables

| Build-Variable          | Default | Description                                                      |
|-------------------------|---------|------------------------------------------------------------------|
| `NOVNC_VERSION`         | v1.6.0  | The version of [noVNC](https://github.com/novnc/noVNC).          |
| `WEBSOCKIFY_VERSION`    | v0.13.0 | The version of [websockify](https://github.com/novnc/websockify). |


## Environment Variables

| Environment-Variable  | Default | Description                           |
|-----------------------|---------|---------------------------------------|
| `NOVNC_LISTEN_HOST`   | 0.0.0.0 | The listening interface of the Proxy. |
| `NOVNC_LISTEN_PORT`   | 6081    | The listening Port of the Proxy.      |
| `NOVNC_REMOTE_SERVER` |         | The remote VNC Server.                |
