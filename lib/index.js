function start (services) {
  const server = require('express')();
  const { register, collectDefaultMetrics } = require('prom-client');

  server.get('/metrics', (req, res) => {
    Promise.all(services.collectors.map(collector => collector.collect(services))).then(() => {
      res.set('Content-Type', register.contentType);
      res.end(register.metrics());
    }).catch(console.log);
  });

  collectDefaultMetrics();

  const port = 3000;
  console.log(`Server listening on ${port}, metrics exposed on /metrics endpoint`);
  server.listen(port);
  return server;
}

module.exports = { start };
