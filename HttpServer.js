const url = require('url');
const _addStaticRoute = require('./addStaticRoute');
const _startHttpServer = require('./startHttpServer');
const _initializeRestHandler = require('./initializeRestHandler');

function _fixRoute (route, project) {
  const buildRoute = project.getRouteHandlerUtil().buildRoute;
  route.method = route.method || 'GET';

  let origHandler = route.handler;

  route.handler = (rest) => {
    rest.res.setHeader('Content-Type', 'text/html; charset=utf-8');

    buildRoute({
      project: project,
      route: route,
      out: rest.res,
      params: rest.params,
      query: rest.url.query,
      handler: origHandler
    });
  };
}

function _loadRoutes (httpServer) {
  const project = httpServer.project;

  _addStaticRoute(httpServer,
    url.parse(project.getStaticUrlPrefix()).pathname,
    project.getOutputDir());

  project.getRoutes().forEach((route) => {
    _fixRoute(route, project);
    httpServer.restHandler.addRoute(route);
  });
}

module.exports = class HttpServer {
  constructor (project) {
    this.project = project;
    this.logger = project.logger('http-server');
    this.requestLogger = project.logger('http-server request');
    this.restHandler = require('rest-handler').create();
  }

  start () {
    let ssl = false;
    const project = this.project;

    _initializeRestHandler(this);
    _loadRoutes(this);

    return _startHttpServer(this).then(() => {
      if (process.send) {
        // We were launched by browser-refresh so tell the parent process
        // that we are ready...
        process.send('online');
      }

      let selfUri = ssl
        ? 'https://localhost'
        : 'http://localhost';

      selfUri += ':' + project.getHttpPort();

      if (project.getColors()) {
        selfUri = selfUri.white.underline;
      }

      this.logger.success('LISTENING ON: ' + selfUri);
    });
  }
};
