const CryptoExporter = require('./lib');

const services = {
  collectors: require('./lib/collectors'),
  http: require('./lib/util/http')
};

CryptoExporter.start(services);
