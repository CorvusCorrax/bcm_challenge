const request = require('request');
const csvIO = require('csv.io');
const http = require('http');

const importer = csvIO.importer;

const requestParams = require('./requestParams.json');

if (!requestParams) {
  throw new Error("Missing request parameters");
}

const csvOptions = {
  columns: [
    { name: 'id', type: 'string' },
    { name: 'price', type: 'number' },
    { name: 'departure_time', type: 'string' },
    { name: 'arrival_time', type: 'string' }
  ],
  skipFirstLine: true,
  delimiter: ','
};

var importCsv = new importer(csvOptions);

var lastCall = new Date(new Date() - 2 * 60000);
var lastResults = '';

http.createServer(function (req, res) {
  if (req.url !== "/api/flights") {
    res.writeHead(404);
    res.write('Not Found');
    return res.end();
  }

  if (new Date() - lastCall < 60000) {
    console.log('JIPIB :', new Date() - lastCall);
    console.log('OUHBYGVY8V :', lastResults);
    res.writeHead(200, {'Content-Type': 'json/application'});
    res.write(lastResults);
    return res.end();
  }

  var promiseAirJazz = new Promise((resolve, reject) => {
    request(requestParams.airJazz, function (error, response, body) {
      if (error) {
        return reject(error);
      }
      if (!response) {
        return reject('No response');
      }
      if (response.statusCode !== 200) {
        return reject('statusCode: ' + response.statusCode + ', body: ' + body);
      }

      const parsedBody = JSON.parse(body);
      let result = [];
      parsedBody.forEach(function(flight) {
        result.push({
          "provider": "AIR_JAZZ",
          "price": flight.price,
          "departure_time": flight.dtime,
          "arrival_time": flight.atime
        });
      });
      resolve(result);
    });
  });

  var promiseAirMoon = new Promise((resolve, reject) => {
    request(requestParams.airMoon, function (error, response, body) {
      if (error) {
        return reject(error);
      }
      if (!response) {
        return reject('No response');
      }
      if (response.statusCode !== 200) {
        return reject('statusCode: ' + response.statusCode + ', body: ' + body);
      }

      let result = JSON.parse(body);
      result.forEach(function(flight) {
        flight.provider = "AIR_MOON";
        delete flight.id;
      });
      resolve(result);
    });
  });

  var promiseAirBeam = new Promise((resolve, reject) => {
    request(requestParams.airBeam, function (error, response, body) {
      if (error) {
        return reject(error);
      }
      if (!response) {
        return reject('No response');
      }
      if (response.statusCode !== 200) {
        return reject('statusCode: ' + response.statusCode + ', body: ' + body);
      }

      let result = [];

      var outputStream = importCsv.getOutput(function(line, cb) {
        result.push({
          "provider": "AIR_BEAM",
          "price": line.price,
          "departure_time": line.departure_time,
          "arrival_time": line.arrival_time
        });
        return cb();
      });

      outputStream.on('error', function(err) {
        reject(err);
      }).on('finish', function() {
        resolve(result);
      });

      importCsv.write(body);
      importCsv.end();
    });
  });

  Promise.all([promiseAirJazz, promiseAirMoon, promiseAirBeam]).then(resultArray => {
    let results = resultArray[1].concat(resultArray[2]).concat(resultArray[3]);

    results.sort((flight1, flight2) => {
      return flight1.price - flight2.price;
    });

    results = results.slice(0, 50);
    lastResults = JSON.stringify(results);
    lastCall = new Date();
    res.writeHead(200, {'Content-Type': 'json/application'});
    res.write(lastResults);
    res.end();
  }).catch(error => {
    console.log('ERROR : ', error);
    res.writeHead(500);
    res.write('Server error');
    res.end();
  });
}).listen(8080);
