'use strict';

// Module dependencies
var Cluster = require('cluster2'),
    express = require('express'),
    app = express(),
    UserProvider = require('./modules/user-provider').userProvider;

// Create API module
var userProvider = new UserProvider();

// Configure server
app.use(express.bodyParser());
app.use(express.cookieParser('that is our secret in here...'));


// API router
app.get('/user-info', function (req, res) {
  var type = req.query.type,
      username = req.query.username;

  if (type === 'short') {
    userProvider.searchByName(username, function (err, data) {
      res.send(data);
    });
  } else if (type === 'full') {
    userProvider.searchByName(username, function (err, data) {
      if (err !== null) {
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
    port: 8100,
    host: '127.0.0.1'
});

// Start server
c.listen(function(cb) {
    cb(app);
});

