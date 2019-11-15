'use strict';

const _padRight = require('pad-right');

module.exports = (httpServer) => {
  const project = httpServer.project;
  const logger = httpServer.logger;
  const requestLogger = httpServer.requestLogger;
  const colorsEnabled = project.getColors();
  const middleware = project.getMiddleware();
  const routeNotFound = project.getRouteNotFound();

  if (middleware) {
    httpServer.restHandler.middleware(middleware);
  }

  httpServer.restHandler
    .on('route', (event) => {
      let desc;
      if (colorsEnabled) {
        desc = '[route]'.green + ' ' + _padRight(event.method, 7, ' ').bold + ' ' + event.route.toString().grey;
      } else {
        desc = '[route] ' + _padRight(event.method, 7, ' ') + ' ' + event.route.toString();
      }

      logger.info(desc);
    })

    .on('beforeHandle', (rest) => {
      if (rest.route.logRequests === false) {
        return;
      }

      let message = rest.req.method + ' ' + rest.req.url;

      if (rest.forwardFrom) {
        const forwardFromPaths = [];
        for (let i = 0; i < rest.forwardFrom.length; i++) {
          forwardFromPaths.push(rest.forwardFrom[i].path);
        }
        message += ' (FORWARDED FROM: ' + forwardFromPaths.join(' -> ') + ')';
      }

      requestLogger.info(message);
    })

    .on('routeNotFound', (req, res) => {
      if (routeNotFound) {
        routeNotFound(req, res);
      } else {
        requestLogger.info('NOT FOUND: ' + req.method + ' ' + req.url);
      }
    });
};
