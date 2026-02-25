SHELL := powershell.exe
IMAGE_PREFIX = pgmystery/workstation
BASE_VNC_IMAGE = pgmystery/ubuntu_vnc:xfce

.PHONY: all base node python ai fullstack java go rust devops

all: base node python ai fullstack java go rust devops

base:
	docker build -t $(IMAGE_PREFIX)-base:latest ./base --build-arg BASE_IMAGE=$(BASE_VNC_IMAGE)

node: base
	docker build -t $(IMAGE_PREFIX)-node:latest ./node --build-arg BASE_IMAGE=$(IMAGE_PREFIX)-base:latest

python: base
	docker build -t $(IMAGE_PREFIX)-python:latest ./python --build-arg BASE_IMAGE=$(IMAGE_PREFIX)-base:latest

ai: python
	docker build -t $(IMAGE_PREFIX)-ai:latest ./ai --build-arg BASE_IMAGE=$(IMAGE_PREFIX)-python:latest

fullstack: base
	docker build -t $(IMAGE_PREFIX)-fullstack:latest ./fullstack --build-arg BASE_IMAGE=$(IMAGE_PREFIX)-base:latest

java: base
	docker build -t $(IMAGE_PREFIX)-java:latest ./java --build-arg BASE_IMAGE=$(IMAGE_PREFIX)-base:latest

go: base
	docker build -t $(IMAGE_PREFIX)-go:latest ./go --build-arg BASE_IMAGE=$(IMAGE_PREFIX)-base:latest

rust: base
	docker build -t $(IMAGE_PREFIX)-rust:latest ./rust --build-arg BASE_IMAGE=$(IMAGE_PREFIX)-base:latest

devops: base
	docker build -t $(IMAGE_PREFIX)-devops:latest ./devops --build-arg BASE_IMAGE=$(IMAGE_PREFIX)-base:latest
