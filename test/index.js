const Test = require('ava').test;
const SuperTest = require('supertest');
const Sinon = require('sinon');

const CryptoExporter = require('./../lib');

let server;
const fakes = {
  collectors: [
    { collect: Sinon.spy() },
    { collect: Sinon.spy() }
  ]
};

Test.before('server', t => {
  server = CryptoExporter.start(fakes);
});

Test.cb('GET /metrics - collects the data', t => {
  SuperTest(server)
    .get('/metrics')
    .expect(200)
    .end((err, res) => {
      t.true(fakes.collectors.every(c => c.collect.called));
      t.end();
    })
});
