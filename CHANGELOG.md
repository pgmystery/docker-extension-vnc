# Changelog

History of all released versions and changes

## v1.3.4
### Changed
- Add info buttons for the docker image connection option text-fields.

## v1.3.3
### Fixed
- The DragViewportButton was not highlighted when selected
- Fix a bug where the extension crashes when a container got selected without any exposed ports in the docker container connection-type.

## v1.3.2
### Fixed
- With Docker Desktop version >=4.42.0, the response data of the request to the backend changed.
- Some input highlighting if not focus.

### Added
- Add new option on the "Docker Container" connection-type: Stop Container after disconnect.
- Added an example of what you can do with this extension.

## v1.3.1
### Changed
- Update the clipboard menu to handle a large amount of text better. 

## v1.3.0
### Added
- Display the image size of the selected example Docker image on the Dashboard.
- Screenshot button to capture the canvas and save the image locally.
- Record button to capture the canvas as a video and save it on the user's computer.
- GitHub URL link on the Dashboard for the selected example Docker image.
- Bell sound playback when triggered by the server.
- Option in the Clipboard menu to toggle the text field to a password input.
- New connection type: **Docker Image**.
- Feature to commit the current Docker container as a new Docker image.
- Update button for the proxy Docker image when a newer version is available on Docker Hub.
- Update button for the selected example Docker container environment if a newer version is available on Docker Hub.

### Changed
- Disabled session-related buttons when no active session is available (e.g., disconnected state).

### Updated
- **NoVNC Proxy**: Websockify updated from version `v0.12.0` to `v0.13.0`.


## v1.2.0
- Fix bug with "Toggle keys" under a windows machine.
- Add a new button for copy the url of the proxy-websocket.
- Fix a bug when a docker image has the same name as the example container.
- Add a toggle button for showing the password in credentials as plaintext.
- Change variants of some buttons.
- Update packages for security reasons.
- Fix bug where the session name in the bar is not getting deleted after deleting the session.
- Add a new option to clone a session in the edit session dialog.
- Change the Example Container button in the Dashboard and add more GUI Environments to try out:
    - [Xfce](https://github.com/pgmystery/docker-extension-vnc/tree/main/docker/vnc_ubuntu/xfce)
    - [Cinnamon](https://github.com/pgmystery/docker-extension-vnc/tree/main/docker/vnc_ubuntu/cinnamon)
    - [MATE](https://github.com/pgmystery/docker-extension-vnc/tree/main/docker/vnc_ubuntu/mate)
    - [KDE-Plasma](https://github.com/pgmystery/docker-extension-vnc/tree/main/docker/vnc_ubuntu/kde-plasma)
    - [LXDE](https://github.com/pgmystery/docker-extension-vnc/tree/main/docker/vnc_ubuntu/lxde)
    - [LXQT](https://github.com/pgmystery/docker-extension-vnc/tree/main/docker/vnc_ubuntu/lxqt)
    - [xTerm](https://github.com/pgmystery/docker-extension-vnc/tree/main/docker/vnc_ubuntu/xterm)

## v1.1.0
- VNC settings for scaling the viewport.
- Add a way to drag the screen of the vnc viewport.
- Fix a bug on trying to have 2 connections at the same time.
- Fix other bugs with the dialogs.

## v1.0.2
- Fix Typos.
- Fix mouse cursor hide bug after fullscreen on some devices.
- Fix a bug when the proxy got deleted not by the extension.
- Focus the VNC screen is now better after switching to a different window.
- Fix some other small bugs.

## v1.0.1
- Fix Typos.
- Fix a bug, where you can't connect to stopped containers.
- Fix a bug, where a stopped container can't start because of the deleted proxy network.
- Add a "Start example container" button to the dashboard.

## v1.0.0
- First Version
