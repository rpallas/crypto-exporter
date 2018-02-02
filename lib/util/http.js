const Got = require('got');
const Pkg = require('../../package.json');

async function request(url) {
  const requestOptions = {
    json: true,
    headers: { 'user-agent': `crypto-exporter/${Pkg.version}` }
  };
  try {
    return await Got(url, requestOptions);
  } catch (error) {
    console.log(`http request error. Url: ${url}, ${error}`);
  }
}

module.exports = { request };
