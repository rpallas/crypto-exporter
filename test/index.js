const Test = require('ava').test;
const SuperTest = require('supertest');
const Sinon = require('sinon');

const CryptoExporter = require('./../lib');

let server;
const fakeCollectors = [
  { collect: Sinon.spy() },
  { collect: Sinon.spy() }
];

Test.before('server', t => {
  server = CryptoExporter.start(fakeCollectors);
});

Test.cb('/metrics collects the data', t => {
  SuperTest(server)
    .get('/metrics')
    .expect(200)
    .then(res => {
      t.true(fakeCollectors.every(c => c.collect.called));
      cb.end();
    })
});
