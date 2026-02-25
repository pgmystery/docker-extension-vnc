SHELL := powershell.exe
BASE_REPO=pgmystery/vnc-debian-base
XFCE_REPO=pgmystery/debian_xfce

.PHONY: all base xfce

all: base xfce

base:
	docker build -t $(BASE_REPO):latest -f base/Dockerfile ..

xfce: base
	docker build -t $(XFCE_REPO):xfce ./xfce
	docker build -t $(XFCE_REPO):latest ./xfce
