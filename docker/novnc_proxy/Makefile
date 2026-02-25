SHELL := powershell.exe
IMAGE := pgmystery/proxy_vnc
TAG := latest
CONTAINER_NAME := novnc-proxy

# Default VNC server if not specified
# Use host.docker.internal to connect to VNC server running on host
NOVNC_REMOTE_SERVER ?= host.docker.internal:5900

.PHONY: build run stop clean help

build:
	docker build -t $(IMAGE):$(TAG) .

run:
	docker run -d --name $(CONTAINER_NAME) \
		-p 6081:6081 \
		-p 7900:7900 \
		-e NOVNC_REMOTE_SERVER=$(NOVNC_REMOTE_SERVER) \
		$(IMAGE):$(TAG)

stop:
	docker stop $(CONTAINER_NAME) || true
	docker rm $(CONTAINER_NAME) || true

clean: stop
	docker rmi $(IMAGE):$(TAG) || true

help:
	@echo "Available targets:"
	@echo "  build   - Build the docker image"
	@echo "  run     - Run the container (set NOVNC_REMOTE_SERVER to override default)"
	@echo "  stop    - Stop and remove the container"
	@echo "  clean   - Remove the image and stop container"
