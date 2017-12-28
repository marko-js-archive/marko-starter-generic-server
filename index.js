'use strict';

const HttpServer = require('./HttpServer');

exports.name = 'generic-http-server';

exports.provides = [
  'http-server'
];

exports.install = (pluginContext) => {
  Object.assign(pluginContext.models.Project.properties, {
    httpPort: {
      type: 'integer',
      description: 'HTTP port number to listen on',
      default: 8080
    },

    sslCert: {
      type: String,
      description: 'Path to SSL certificate (optional)'
    },

    sslKey: {
      type: String,
      description: 'Path to private SSL key (optional)'
    },

    routeNotFound: {
      type: Function,
      description: 'Function to handle missing routes (optional)'
    }
  });
};

exports.projectCreated = (project) => {
  let httpServer = new HttpServer(project);
  project.startServer = () => {
    return httpServer.start();
  };
};
