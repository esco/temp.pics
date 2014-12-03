// Module dependencies
var http = require('http');
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var serveStatic = require('serve-static');
var session = require('express-session');
var methodOverride = require('method-override');
var morgan = require('morgan');
var errorHandler = require('errorhandler');
var device = require('express-device');
var nunjucks = require('nunjucks');
var config = require('./config');
var locals = require('./lib/locals');
var app = express();

http.globalAgent.maxSockets = 999999;

// Middleware
app.set('port', process.env.PORT || 3000);
app.use(morgan('dev'));
app.use(bodyParser());
app.use(methodOverride());
app.use(device.capture());
app.use(serveStatic(path.join(__dirname, 'public'), {'index': ['index.html']}));
app.use(session({secret: config.session.secret}));
app.use(locals());
device.enableDeviceHelpers(app);

// Views
nunjucks.configure('views', {
  autoescape: true,
  express: app
});

// Development only
if ('development' == app.get('env')) {
  app.use(errorHandler());
}

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

module.exports = app;