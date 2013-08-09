'use strict';

// Require some modules
var Cluster = require('cluster2'),
    Express = require('express'),
    UserProvider = require('./modules/user-provider'),
    Settings = require('./settings');


// Our fancy app
var App = Express();

App.use(Express.bodyParser());
App.use(Express.cookieParser(Settings.cookie_secret_key));

// ...and routes
App.get('/user-info', function(req, res) {
  var req_type = req.query.type,
      username = req.query.username;

  if (req_type == 'short') {
    UserProvider.getShortInfo(username, function(err, data) {
      res.send(data);
    });
  } else {
    UserProvider.getFullInfo(username, function(err, data){
      res.send(data);
    });
  }
});

// Run al of this stuff in a cluster
var Cl = new Cluster({
  host: Settings.address,
  port: Settings.port
});

Cl.listen(function(cb) {
  cb(App);
});

