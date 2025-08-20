const http = require('http');

const port = process.env.PORT || 5000;
const options = {
  host: '127.0.0.1',
  port,
  path: '/api/health',
  timeout: 2000,
};

const request = http.request(options, (res) => {
  if (res.statusCode === 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

request.on('error', () => process.exit(1));
request.end();


