FROM prom/prometheus:latest@sha256:0283ae2509e1ccc71830edf382713cc3906aa55ca9418c50911854223829bf0b

CMD [ "--config.file=/etc/prometheus/prometheus.yml", \
      "--storage.tsdb.path=/prometheus", \
      "--storage.tsdb.retention=400d", \
      "--web.console.libraries=/usr/share/prometheus/console_libraries", \
      "--web.console.templates=/usr/share/prometheus/consoles" ]
