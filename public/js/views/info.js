'use strict';
define([
  'jquery',
  'underscore',
  'backbone',
  'vm',
  'views/someter',
  'text!templates/info.html',
  'text!templates/compare.html',
  'events'
], function ($, _, Backbone, Vm, SometerView, InfoTemplate, CompareTemplate, vent) {
  var InfoView = Backbone.View.extend({
    el: '.results',
    initialize: function() {

    },
    render: function() {
      var tbls = [],
          el = this.$el,
          tables = [],
          data, username;

      el.html(InfoTemplate);

      vent.on('compare', function (e) {
        var comp = $('.section-compare');
        var someter, classname = '', somdata;

        username = e.username;
        data = e.model.attributes;

        if (!!e.update) {
          comp.removeClass('active');
        }

        somdata = {
          played: data.summary.played.value,
          win_p: data.summary.won.value,
          avg_exp: data.summary.average_exp.value
        };

        for (var item in somdata) {
          somdata[item] = somdata[item].toString();
          if (somdata[item].length > 3) {
            classname = 'small';
          }
        }

        comp.html(CompareTemplate);
        comp.find('.username').html(username);
        someter = comp.find('.someter');

        tables = [
          comp.find('.summary'),
          comp.find('.nations'),
          comp.find('.types'),
          comp.find('.battle_stats')
        ];

        someter.append('<li class="item"><span class="label">Количество боёв</span><span class="value '+classname+'">'+somdata.played+'</span></li>')
        someter.append('<li class="item"><span class="label">Процент побед</span><span class="value '+classname+'">'+somdata.win_p+'</span></li>')
        someter.append('<li class="item"><span class="label">Средний опыт за бой</span><span class="value '+classname+'">'+somdata.avg_exp+'</span></li>')

        tbls = [];
        for (var datasheet in data) {
          tbls.push(data[datasheet]);
        }
        for (var i = 0; i < tables.length; i++) {
          var table = tables[i],
              datapart = tbls[i];

          for (var value in datapart) {
            table.append('<li class="item"><span class="value">'+datapart[value].value+'</span></li>');
          }
        }

        if (!!e.update) {
          setTimeout(function() {
            comp.addClass('active');
          }, 400);
        } else {
          comp.addClass('active');
        }

        localStorage.setItem('wowp_stats_'+username+'', JSON.stringify({data: data, timestamp: new Date().getTime()}));
      });

      data = this.model.attributes;
      username = this.options.username;

      var someterView = Vm.create({}, 'SometerView', SometerView, {
        played: data.summary.played.value,
        win_p: data.summary.won.value,
        avg_exp: data.summary.average_exp.value
      });

      someterView.render();

      tables = [
        el.find('.summary'),
        el.find('.nations'),
        el.find('.types'),
        el.find('.battle_stats')
      ];

      for (var datasheet in data) {
        tbls.push(data[datasheet]);
      }
      for (var i = 0; i < tables.length; i++) {
        var table = tables[i],
            datapart = tbls[i];

        for (var value in datapart) {
          table.append('<li class="item"><span class="name">'+datapart[value].name+'</span><span class="value">'+datapart[value].value+'</span></li>');
        }
      }
      el.find('.username').html(username);
      el.find('.info').fadeIn(200);

      localStorage.setItem('wowp_stats_'+username+'', JSON.stringify({data: this.model.attributes, timestamp: new Date().getTime()}));
    },
    events: {
      'click .btn.compare': 'compare'
    },
    compare: function (e) {
      var btn = $(e.target);

      btn.toggleClass('active');

      if (!!$('.section-compare').hasClass('active') && !btn.hasClass('active')) {
        $('.section-compare').removeClass('active');
      } else if ($('.section-compare').html().length > 0 && !$('.section-compare').hasClass('active')) {
        $('.section-compare').addClass('active');
      }
    }
  });

  return InfoView;
});
