SHELL := powershell.exe
BASE_REPO=pgmystery/vnc-kali-base
KALI_REPO=pgmystery/kali_vnc

.PHONY: all base headless large

all: base headless large

base:
	docker build -t $(BASE_REPO):latest -f base/Dockerfile ..

headless: base
	docker build -t $(KALI_REPO):headless ./headless

large: base
	docker build -t $(KALI_REPO):large ./large
