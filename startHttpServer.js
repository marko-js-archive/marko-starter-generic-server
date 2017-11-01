'use strict';

const fs = require('fs');

module.exports = (httpServer) => {
  return new Promise((resolve, reject) => {
    const project = httpServer.project;
    const logger = httpServer.logger;
    const sslCert = project.getSslCert();
    const sslKey = project.getSslKey();
    const httpPort = project.getHttpPort();

    let ssl = false;
    let httpsOptions;

    if (sslCert || sslKey) {
      // make sure BOTH cert and key are provided
      if (!sslCert || !sslKey) {
        logger.error('Both "cert" and "key" arguments are required for SSL support.');
        process.exit(2);
      }
      httpsOptions = {};
      try {
        httpsOptions.cert = fs.readFileSync(sslCert);
      } catch (e) {
        logger.error(`Unable to read ertificate file "${sslCert}" for SSL support. ${e.stack || e}`);
        process.exit(3);
      }
      try {
        httpsOptions.key = fs.readFileSync(sslKey);
      } catch (e) {
        logger.error(`Unable to read private key file "${sslKey}" for SSL support. ${e.stack || e}`);
        process.exit(4);
      }
      ssl = true;
    }

    let server;
    if (ssl) {
      server = require('https').createServer(httpsOptions);
    } else {
      server = require('http').createServer();
    }

    server.on('request', (req, res) => {
      httpServer.restHandler.handle(req, res);
    });

    server.on('error', reject);

    // start listening for requests
    server.listen(httpPort, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(ssl);
      }
    });
  });
};
