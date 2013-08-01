phantom = require('phantom');

var userProvider = function() {};

// Request short info
userProvider.prototype.searchByName = function (username, callback) {
  phantom.create({port: 8081}, function (ph) {
    ph.createPage(function (page) {
      page.open('http://worldofwarplanes.ru/community/accounts/', function (status) {
        if (status === 'fail') {
          callback(status);
        } else {
          page.includeJs('http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js', function() {
            page.evaluate(function (username) {
                var url = 'search?search='+username+'';
                return $.ajax({
                  url: url,
                  async: false
                });
            }, function (res) {
              var data = JSON.parse(res.responseText).request_data.items;

              if (data.length !== 0) {
                for (var i = 0; i < data.length; i++) {
                  data[i].account_url = 'http://worldofwarplanes.ru' + data[i].account_url;
                }
                callback(null, data);
                ph.exit();
              } else {
                callback('error', res.status);
                ph.exit();
              }
            }, username);
          });
        }
      });
    });
  });
};

// Request full info
userProvider.prototype.getUserInfo = function (username, user_id, callback) {
  phantom.create(function (ph) {
    ph.createPage(function (page) {
      page.open('http://worldofwarplanes.ru/community/accounts/'+user_id+'-'+username+'/', function (status) {
        if (status === 'fail') {
          callback(status);
        } else {
          page.includeJs('http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js', function() {
            page.evaluate(function() {
                var user_data = {
                  summary: {},
                  battle_stats: {},
                  planes_types: {},
                  nations: {}
                };
                var table1 = $('.b-result').first().find('.td-value'),
                    table2 = $('.b-result').first().next().find('.td-value');
                var table1_names = ['played', 'won', 'draw', 'defeat', 'survived', 'average_exp', 'max_exp'],
                    table2_names = ['players_killed', 'objects_destroyed', 'helped_kill', 'average_killed', 'average_destroyed', 'average_helped', 'max_killed', 'max_destroyed', 'max_help'];
                var diagTable1 = $('.t-table-dotted__diagram').first().find('.t-diagram_info'),
                    diagTable2 = $($('.t-table-dotted__diagram')[1]).find('.t-diagram_info');
                var diagTable1_names = ['light_fighter', 'heavy_fighter', 'ground_attack', 'navy_fighter'],
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
                callback(null, data);
                ph.exit();
            });
          });
        }
      });
    });
  });
}

exports.userProvider = userProvider;
