const send = require('send');

function _cors (rest) {
  // enable CORS support
  var origin = rest.getRequestHeader('Origin');
  if (origin) {
    rest.setResponseHeader('Access-Control-Allow-Origin', origin);
    rest.setResponseHeader('Access-Control-Allow-Credentials', true);
    rest.setResponseHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    rest.setResponseHeader('Access-Control-Allow-Headers', 'X-SESSIONID,Content-Type,Accept,Origin,User-Agent,Cache-Control,Keep-Alive,X-Requested-With,If-Modified-Since');
  }
}

module.exports = function (httpServer, staticUrlPrefix, baseDir) {
  const logger = httpServer.logger;
  let routePath = staticUrlPrefix;
  if (routePath.charAt(routePath.length - 1) !== '/') {
    routePath += '/';
  }

  routePath += '**';

  httpServer.restHandler.addRoute({
    method: 'OPTIONS',

    path: routePath,

    logRequests: false,

    handler: function (rest) {
      _cors(rest);
      rest.setResponseHeader('Access-Control-Max-Age', 1728000);
      rest.setResponseHeader('Content-Type', 'text/plain; charset=UTF-8');
      rest.end();
    }
  });

  httpServer.restHandler.addRoute({
    method: 'GET',

    path: routePath,

    logRequests: false,

    handler: function (rest) {
      _cors(rest);
      const filePath = rest.params[0];
      const sender = send(rest.req, filePath, {
        root: baseDir,
        index: 'index.html'
      });

      sender
        .on('error', (err) => {
          logger.error(err);
          rest.error(err);
        })
        .on('directory', (dir) => {
          sender.path = filePath + '/index.html';
          sender.pipe(rest.res);
        })
        .pipe(rest.res);
    }
  });
};
