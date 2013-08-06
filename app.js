'use strict';

// Module dependencies
var Cluster = require('cluster2'),
    express = require('express'),
    app = express(),
    UserProvider = require('./modules/user-provider').userProvider,
    settings = require('./settings');

// Create API module
var userProvider = new UserProvider();

// Configure server
app.use(express.bodyParser());
app.use(express.cookieParser(settings.cookie_secret_key));


// API router
app.get('/user-info', function (req, res) {
  var type = req.query.type,
      username = req.query.username;

  if (type === 'short') {
    userProvider.searchByName(username, function (err, data) {
      if (err) {
        res.send(404, err);
      } else {
        res.send(data);
      }
    });
  } else if (type === 'full') {
    userProvider.searchByName(username, function (err, data) {
      if (err) {
        res.send(404, err);
      } else {
        userProvider.getUserInfo(username, data[0].id, function (error, userdata) {
          res.cookie('wowp_username', username, {expires: new Date(Date.now() + 2592000000)});
          res.send(userdata);
        });
      }
    });
  }
});

// Create cluster
var c = new Cluster({
  host: settings.address,
  port: settings.port
});

// Start server
c.listen(function(cb) {
    cb(app);
});

