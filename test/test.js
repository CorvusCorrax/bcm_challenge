var assert = require('assert');
var http = require('http');
var server;

describe('/api/flight', function() {
  it('should start the server', function() {
    server = require('../index.js');
  });

  it('should return a list of 50 flights, ordered by ascending price', function() {
    http.get('http://127.0.0.1:8080/api/flights', (resp) => {
      let data = '';

      resp.on('data', (chunk) => {
        data += chunk;
      });

      resp.on('end', () => {
        let result = JSON.parse(data);
        assert(Object.prototype.toString.call(result) === '[object Array]', 'Result should be an array');
        assert.equal(result.length, 50, 'Array should have a length of 50');
        for (let i = 0; i < result.length; i++) {
          assert(result[i].provider === 'AIR_JAZZ' ||
                result[i].provider === 'AIR_MOON' ||
                result[i].provider === 'AIR_BEAM', 'Provider should be one of the 3 possible'
          );
          assert(typeof result[i].price === 'number', 'Price should be a number');
        }
        for (let i = 0; i < result.length - 1; i++) {
          assert(result[i] < result[i+1], 'Array should be ordered by ascending price');
        }
      });

    }).on("error", (err) => {
      throw err;
    });
  });

  it('should return error 404 when querying an invalid url', function() {
    http.get('http://127.0.0.1:8080/invalid/url', (resp) => {
      let data = '';

      resp.on('data', (chunk) => {
        data += chunk;
      });

      resp.on('end', () => {
        assert.equal(data, 'Not Found');
      });

    }).on("error", (err) => {
      throw err;
    });;
  });
});
