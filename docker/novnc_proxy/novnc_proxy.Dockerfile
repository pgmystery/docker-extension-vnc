FROM python:3.12

ARG NOVNC_VERSION="v1.6.0"
ARG WEBSOCKIFY_VERSION="v0.13.0"

ENV NOVNC_LISTEN_HOST="0.0.0.0"
ENV NOVNC_LISTEN_PORT=6081

RUN git clone --depth 1 --branch $NOVNC_VERSION https://github.com/novnc/noVNC.git

WORKDIR /noVNC

RUN git clone --depth 1 --branch $WEBSOCKIFY_VERSION https://github.com/novnc/websockify ./utils/websockify
RUN pip3 install numpy

COPY ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE $NOVNC_LISTEN_PORT

ENTRYPOINT ["/entrypoint.sh"]
