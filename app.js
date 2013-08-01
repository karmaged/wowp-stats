'use strict';

// Module dependencies
var Cluster = require('cluster2'),
    async = require('async'),
    express = require('express'),
    app = express(),
    UserProvider = require('./modules/user-provider').userProvider,
    settings = require('./settings'),
    MongoClient = require('mongodb').MongoClient;

var users;

MongoClient.connect('mongodb://localhost:27017/wowp', function (err, db) {
  if (err) {
    return console.log(err);
  }

  db.collection('users', function (error, collection) {
    if (error) {
      return console.log(error);
    }

    users = collection;
  });
});

// users.find().toArray(function (err, items) {
//   if (err) {
//     return console.log(err);
//   }

//   async.eachSeries(items, function (item, callback) {
//     userProvider.getUserInfo(item.username, item.user_id, function (err, userdata) {
//       if (err) {
//         return console.log(err);
//       }

//       users.update({username: item.username}, {$set:{data: userdata}}, {w: 1}, function (err, result) {
//         if (err) {
//           return console.log(err);
//         }

//         users.update({username: item.username}, {$push:{timeline: {timestamp: new Date().getTime(), data: userdata}}}, {w: 1}, function (err, result) {
//           if (err) {
//             return console.log(err);
//           }

//           callback();
//         });
//       });
//     });
//   },
//   function (err) {
//     if (err) {
//       return console.log(err);
//     }
//   });
// });

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
      res.send(data);
    });
  } else if (type === 'full') {
    users.findOne({username: username}, function (err, item) {
      if (err) {
        return console.log(err);
      } else if (item === null) {
        userProvider.searchByName(username, function (err, data) {
          if (err !== null) {
            res.send(404, err);
          } else {
            userProvider.getUserInfo(username, data[0].id, function (err, userdata) {
              if (err) {
                res.send(404, err);
              } else {
                updateDb(username, data[0].id);
              }
            });
          }
        });
      } else if (item !== null) {
        var dataTime = item.timeline[item.timeline.length-1].timestamp;
        if ((new Date().getTime() - dataTime) >= 86400000) {
          updateDb(username, data[0].id);
        } else {
          res.cookie('wowp_username', username, {expires: new Date(Date.now() + 2592000000)});
          res.send(item.data);
        }
      }
    });
  }

  function updateDb (username, id) {
    userProvider.getUserInfo(username, id, function (err, userdata) {
      if (err) {
        res.send(404, err);
      } else {
        users.insert({
          username: username,
          user_id: id,
          data: userdata,
          timeline: [
            {
              timestamp: new Date().getTime(),
              data: userdata
            }
          ]
        }, {w: 1}, function (err, result) {
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

