var Phantom = require('phantom'),
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
  _grabShortUserInfo(username, function(err, data) {
    if (err) {
      cb(err, null);
    } else {
      Phantom.create(function(phantom) {
        phantom.createPage(function (page) {
          page.open(ACCOUNTS_URL + data[0].id + '-' +username + '/', function (status) {
            if (status === 'fail') {
              cb(status);
            } else {
              page.includeJs(JQUERY_URL, function() {
                page.evaluate(function() {
                  var user_data = {
                      summary: {},
                      battle_stats: {},
                      planes_types: {},
                      nations: {}
                    };

                  var table1 = $('.b-result').first().find('.td-value'),
                      table2 = $('.b-result').first().next().find('.td-value'),
                      table1_names = ['played', 'won', 'draw', 'defeat', 'survived', 'average_exp', 'max_exp'],
                      table2_names = ['players_killed', 'objects_destroyed', 'helped_kill', 'average_killed',
                                      'average_destroyed', 'average_helped', 'max_killed', 'max_destroyed', 'max_help'],
                      diagTable1 = $('.t-table-dotted__diagram').first().find('.t-diagram_info'),
                      diagTable2 = $($('.t-table-dotted__diagram')[1]).find('.t-diagram_info'),
                      diagTable1_names = ['light_fighter', 'heavy_fighter', 'ground_attack', 'navy_fighter'],
                      diagTable2_names = ['ussr', 'germany', 'usa', 'japan'];


                  function getValue (context, count) {
                    var value = $(context[count]).text().replace(/\s+/g, '');
                    return value;
                  }

                  for (var i = 0; i < table1_names.length; i++) {
                    user_data.summary[table1_names[i]] = {
                        name: $(table1.prev()[i]).text(),
                        value: getValue(table1, i)
                      }
                  }
                  
                  for (var i = 0; i < table2_names.length; i++) {
                    user_data.battle_stats[table2_names[i]] = {
                        name: $(table2.prev()[i]).text(),
                        value: getValue(table2, i)
                      }
                  }

                  for (var i = 0; i < diagTable1_names.length; i++) {
                    user_data.planes_types[diagTable1_names[i]] = {
                        name: $(diagTable1.next()[i]).text(),
                        value: getValue(diagTable1, i)
                      }
                  }

                  for (var i = 0; i < diagTable2_names.length; i++) {
                    user_data.nations[diagTable2_names[i]] = {
                        name: $(diagTable2.next()[i]).text(),
                        value: getValue(diagTable2, i)
                      }
                  }

                  return user_data;
                }, function (data) {
                  cb(null, data);
                  phantom.exit();
                });
              });
            }
          });
        });
      });
    }
  });
}

