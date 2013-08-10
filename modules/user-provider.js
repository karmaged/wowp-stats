var Phantom = require('phantom'),
    jsdom = require('jsdom'),
    Redis = require('redis').createClient();


var ACCOUNTS_URL = 'http://worldofwarplanes.ru/community/accounts/',
    JQUERY_URL = 'http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js';


/**
 * Return short user info.
 *
 * @param {String} username
 * @param {Function} cb
 * @api private
 */
exports.getShortInfo = function(username, cb) {
  _getUserInfo(username, 'short', function(err, data) {
    if (err) {
      cb(err, null);
    } else {
      if (data) {
        cb(null, data);
      } else {
        _grabShortUserInfo(username, function(err_, data_) {
          if (err_) {
            cb(err_, null);
          } else {
            for (var i=0; i<data_.length; i++) {
              _saveUserInfo(data_[i].name, 'short', JSON.stringify(data_[i]));
            }
            cb(null, data_);
          }
        });
      }
    }
  });
};

/**
 * Return full user info.
 *
 * @param {String} username
 * @param {Function} cb
 * @api private
 */
exports.getFullInfo = function(username, cb) {
  _getUserInfo(username, 'full', function(err, data) {
    if(err) {
      cb(err, null);
    } else {
      if (data) {
        cb(null, data);
      } else {
        _grabFullUserInfo(username, function(err_, data_) {
          if (err_) {
            cb(err_, null);
          } else {
            _saveUserInfo(username, 'full', JSON.stringify(data_));
            cb(null, data_);
          }
        });
      }
    }
  });
};

/**
 * Get user info from DB.
 *
 * @param {String} username
 * @param {String} type
 */
function _getUserInfo(username, type, cb) {
  Redis.hmget(username, type, function(err, data) {
    if (err) {
      cb(err, null);
    } else {
      cb(null, JSON.parse(data[0]));
    }
  });
}

/**
 * Save user info into DB.
 *
 * @param {String} username
 * @param {String} type
 * @param {String} info
 */
function _saveUserInfo(username, type, info) {
  Redis.hmset(username, type, info, function(err, data) {
    if (err) {
      console.log(err);
    }
  });
}

/**
 * Grag user's short info from site.
 *
 * @param {String} username
 */
function _grabShortUserInfo(username, cb) {
  Phantom.create(function(phantom){
    phantom.createPage(function(page) {
      page.open(ACCOUNTS_URL, function(status) {
        if (status === 'fail') {
          cb(status);
        } else {
          page.includeJs(JQUERY_URL, function() {
            page.evaluate(function(username) {
              var url = 'search?search=' + username + '';
              return $.ajax({async: false, url: url});
            }, function(res) {
              var data = JSON.parse(res.responseText).request_data.items;
              if (data.length !== 0) {
                for (var i=0; i<data.length; i++) {
                  data[i].account_url = 'http://worldofwarplanes.ru' + data[i].account_url;
                }
                cb(null, data);
                phantom.exit();
              } else {
                cb('error', res.status);
                phantom.exit();
              }
            }, username);
          });
        }
      });
    });
  });
}

/**
 * Grab user's full info from site.
 *
 * @param {String} username
 */
function _grabFullUserInfo(username, cb) {
  _grabShortUserInfo(username, function (err, data) {
    if (err) {
      cb(err, null);
    } else {
      jsdom.env(
        ACCOUNTS_URL + data[0].id + '-' +username + '/',
        [JQUERY_URL],
        function (err, window) {
          if (err) {
            cb(err, null);
          }

          var $ = window.$;

          var user_data = {
            summary: {},
            battle_stats: {},
            planes_types: {},
            nations: {}
          };

          var table1 = $('.b-result').first().find('.td-value'),
              table2 = $('.b-result').first().next().find('.td-value'),
              table1_names = ['played', 'won', 'draw', 'defeat', 'survived', 'average_exp', 'max_exp'],
              table2_names = ['players_killed', 'objects_destroyed', 'helped_kill', 'average_killed', 'average_destroyed', 'average_helped', 'max_killed', 'max_destroyed', 'max_help'];

          var diagTable1 = $('.t-table-dotted__diagram').first().find('.t-diagram_info'),
              diagTable2 = $($('.t-table-dotted__diagram')[1]).find('.t-diagram_info'),
              diagTable1_names = ['light_fighter', 'heavy_fighter', 'ground_attack', 'navy_fighter'],
              diagTable2_names = ['ussr', 'germany', 'usa', 'japan'];

          var tables = [
            [table1, table1_names, 'summary', 'prev'],
            [table2, table2_names, 'battle_stats', 'prev'],
            [diagTable1, diagTable1_names, 'planes_types', 'next'],
            [diagTable2, diagTable2_names, 'nations', 'next']
          ];

          var counter = tables.length;

          for (var i = 0; i < tables.length; i++) {
            var tablesSet = tables[i];
            setValue(tablesSet[0], tablesSet[1], tablesSet[2], tablesSet[3], function (data) {
              counter = counter - 1;
              if (counter === 0) {
                cb(null, data);
              }
            });
          }

          function getValue (context, count) {
            var value = $(context[count]).text().replace(/\s+/g, '');
            return value;
          }

          function setValue (table, names, type, which, callback) {
            var tableName;
            var counter = names.length;

            if (which === 'prev') {
              tableName = table.prev();
            } else if (which === 'next') {
              tableName = table.next();
            }

            for (var i = 0; i < names.length; i++) {
              user_data[type][names[i]] = {
                name: $(tableName[i]).text(),
                value: getValue(table, i)
              };
              counter = counter - 1;
              if (counter === 0) {
                callback(user_data);
              }
            }
          }
        }
      );
    }
  });
}

