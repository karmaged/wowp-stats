(function() {
  var form = $('.search-form'),
      formSmall = $('.search-small'),
      loader = $('.loader'),
      infoTable = $('.info'),
      summaryTable = infoTable.find('.summary'),
      bstatsTable = infoTable.find('.battle_stats'),
      typesTable = infoTable.find('.types'),
      nationsTable = infoTable.find('.nations'),
      unameCont = $('.username');

  $.backstretch('img/bg.jpg');

  $('.search-form input').focus();
  window.onload = function() {
    form.fadeIn(500);
    pos([form, loader]);
  };

  var loaderAnim = new swiffy.Stage($('.loader')[0], loaderobject);
  loaderAnim.start();

  pos([form, loader]);

  function pos (els) {
    for (var i = 0; i < els.length; i++) {
      var el = els[i];

      el[0].style.top = (window.innerHeight - el[0].clientHeight) / 2 + 'px';
      el[0].style.left = (window.innerWidth - el[0].clientWidth) / 2 + 'px';
    }
  }

  window.onresize = function() {
    pos([form, loader]);
  };

  form.on('submit', function (e) {
    e.preventDefault();

    var username;

    if (form.find('input').val().length === 0) {
      form.find('input')[0].placeholder = 'введите имя пользователя';
    } else {
      username = form.find('input').val();
      form.fadeOut(100, function() {
        loader.fadeIn(100);
        pos([form, loader]);
      });

      if (!localStorage.getItem('wowp_stats_'+username+'')) {
        $.ajax({
          url: '/user-info?type=full&username='+username+'',
          success: function (res) {
            loader.fadeOut(100);
            infoTable.fadeIn(100);
            unameCont.html(username);

            localStorage.setItem('wowp_stats_'+username+'', JSON.stringify({data: res, timestamp: new Date().getTime()}));
            buildTable([summaryTable, nationsTable, typesTable, bstatsTable], res);

            form.find('input').val('');
          },
          error: function (err) {
            form.find('input').val('');
            form.find('input')[0].placeholder = 'такого пользователя нет в системе';
            loader.fadeOut(100, function() {
              form.fadeIn(100);
              pos([form, loader]);
            });
          }
        });
      } else {
        var json = JSON.parse(localStorage.getItem('wowp_stats_'+username+''));

        if ((new Date().getTime() - json.timestamp) >= 86400000) {
          $.ajax({
            url: '/user-info?type=full&username='+username+'',
            success: function (res) {
              localStorage.setItem('wowp_stats_'+username+'', JSON.stringify({data: res, timestamp: new Date().getTime()}));
              buildTable([summaryTable, nationsTable, typesTable, bstatsTable], res);
            },
            error: function (err) {
              form.find('input').val('');
              form.find('input')[0].placeholder = 'такого пользователя нет в системе';
              loader.fadeOut(100, function() {
                form.fadeIn(100);
                pos([form, loader]);
              });
            }
          });
        } else {
          buildTable([summaryTable, nationsTable, typesTable, bstatsTable], json.data);
        }
        setTimeout(function() {
          loader.fadeOut(100, function() {
            infoTable.fadeIn(100);
          });
          unameCont.html(username);
          form.find('input').val('');
        }, 500);
      }
    }
  });
  formSmall.on('submit', function (e) {
    e.preventDefault();

    var username;

    if (formSmall.find('input').val().length === 0) {
      formSmall.find('input')[0].placeholder = 'введите имя пользователя';
    } else {
      username = formSmall.find('input').val();
      infoTable.fadeOut(100, function() {
        loader.fadeIn(100);
      });

      if (!localStorage.getItem('wowp_stats_'+username+'')) {
        $.ajax({
          url: '/user-info?type=full&username='+username+'',
          success: function (res) {
            summaryTable.html('');
            bstatsTable.html('');
            typesTable.html('');
            nationsTable.html('');
            unameCont.html('');

            localStorage.setItem('wowp_stats_'+username+'', JSON.stringify({data: res, timestamp: new Date().getTime()}));
            loader.fadeOut(100);
            buildTable([summaryTable, nationsTable, typesTable, bstatsTable], res);
            infoTable.fadeIn(100);
            unameCont.html(username);
            formSmall.find('input').val('');
            formSmall.find('input')[0].placeholder = 'введите имя игрока и нажмите Enter';
          },
          error: function (err) {
            formSmall.find('input').val('');
            formSmall.find('input')[0].placeholder = 'такого пользователя нет в системе';
            loader.fadeOut(100, function() {
              infoTable.fadeIn(100);
            });
          }
        });
      } else {
        var json = JSON.parse(localStorage.getItem('wowp_stats_'+username+''));

        if ((new Date().getTime() - json.timestamp) >= 86400000) {
          $.ajax({
            url: '/user-info?type=full&username='+username+'',
            success: function (res) {
              summaryTable.html('');
              bstatsTable.html('');
              typesTable.html('');
              nationsTable.html('');
              unameCont.html('');

              localStorage.setItem('wowp_stats_'+username+'', JSON.stringify({data: res, timestamp: new Date().getTime()}));
              buildTable([summaryTable, nationsTable, typesTable, bstatsTable], res);
            },
            error: function (err) {
              formSmall.find('input').val('');
              formSmall.find('input')[0].placeholder = 'такого пользователя нет в системе';
              loader.fadeOut(100, function() {
                infoTable.fadeIn(100);
              });
            }
          });
        } else {
          setTimeout(function() {
            buildTable([summaryTable, nationsTable, typesTable, bstatsTable], json.data);
          }, 500);
        }
        setTimeout(function() {
          loader.fadeOut(100);
          unameCont.html(username);
          infoTable.fadeIn(100);
          formSmall.find('input').val('');
          formSmall.find('input')[0].placeholder = 'введите имя игрока и нажмите Enter';
        }, 500);
      }
    }
  });

  function buildTable (tables, data) {
    var tbls = [];

    for (datasheet in data) {
      tbls.push(data[datasheet]);
    }
    for (var i = 0; i < tables.length; i++) {
      var table = tables[i],
          datapart = tbls[i];

      for (var value in datapart) {
        table.append('<li class="item"><span class="name">'+datapart[value].name+'</span><span class="value">'+datapart[value].value+'</span></li>');
      }
    }
  }
})();
