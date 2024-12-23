FROM python:3.12

ENV NOVNC_LISTEN_HOST="0.0.0.0"
ENV NOVNC_LISTEN_PORT=6081
ENV NOVNC_VERSION="v1.5.0"

RUN git clone --depth 1 --branch $NOVNC_VERSION https://github.com/novnc/noVNC.git

WORKDIR /noVNC

RUN git clone https://github.com/novnc/websockify ./utils/websockify
RUN pip3 install numpy

COPY ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE $NOVNC_LISTEN_PORT

ENTRYPOINT ["/entrypoint.sh"]
