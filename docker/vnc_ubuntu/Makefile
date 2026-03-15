SHELL := powershell.exe
REPO=pgmystery/vnc-ubuntu-base
DISTRO_REPO=pgmystery/ubuntu_vnc

.PHONY: all bases distros core audio-out audio-in audio-full latest xfce gnome mate cinnamon kde-plasma lxde lxqt xterm deepin kali lumina trinity fluxbox fvwm openbox

all: bases distros

# --- Bases ---
bases: core audio-out audio-in audio-full latest

core:
	docker build -t $(REPO):core -f base-core/Dockerfile ..

audio-out: core
	docker build -t $(REPO):audio-out -f base-audio-out/Dockerfile ..

audio-in: core
	docker build -t $(REPO):audio-in -f base-audio-in/Dockerfile ..

audio-full: core
	docker build -t $(REPO):audio-full -f base-audio-full/Dockerfile ..

latest: audio-full
	docker build -t $(REPO):latest -f base/Dockerfile ..

# --- Distros ---
distros: xfce gnome mate cinnamon kde-plasma lxde lxqt xterm

xfce: latest
	docker build -t $(DISTRO_REPO):xfce ./xfce

gnome: latest
	docker build -t $(DISTRO_REPO):gnome ./gnome

mate: latest
	docker build -t $(DISTRO_REPO):mate ./mate

cinnamon: latest
	docker build -t $(DISTRO_REPO):cinnamon ./cinnamon

kde-plasma: latest
	docker build -t $(DISTRO_REPO):kde-plasma ./kde-plasma

lxde: latest
	docker build -t $(DISTRO_REPO):lxde ./lxde

lxqt: latest
	docker build -t $(DISTRO_REPO):lxqt ./lxqt

# xterm uses core base for minimal footprint
xterm: core
	docker build -t $(DISTRO_REPO):xterm ./xterm
