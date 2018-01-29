const collectors = [];
require('fs').readdirSync(__dirname).forEach((file) => {
  if (file !== 'index.js') {
    collectors.push(require(`./${file}`));
  }
});

module.exports = collectors;
