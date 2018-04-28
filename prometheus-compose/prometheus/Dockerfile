FROM prom/prometheus:latest@sha256:14cafab6a73222c859cf46c16bda6b94839d31b7ab25e70ac8aa19809c6055a8

CMD [ "--config.file=/etc/prometheus/prometheus.yml", \
      "--storage.tsdb.path=/prometheus", \
      "--storage.tsdb.retention=400d", \
      "--web.console.libraries=/usr/share/prometheus/console_libraries", \
      "--web.console.templates=/usr/share/prometheus/consoles" ]
