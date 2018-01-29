const server = require('express')();
const { register, collectDefaultMetrics } = require('prom-client');

server.get('/metrics', (req, res) => {
  // Collect metrics here
  res.set('Content-Type', register.contentType);
  res.end(register.metrics());
});

collectDefaultMetrics();

const port = 3000;
console.log(`Server listening on ${port}, metrics exposed on /metrics endpoint`);
server.listen(port);
