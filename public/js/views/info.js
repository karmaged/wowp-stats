'use strict';
define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/info.html'
], function ($, _, Backbone, InfoTemplate) {
  var InfoView = Backbone.View.extend({
    el: '.results',
    initialize: function() {

    },
    render: function() {
      var tbls = [],
          data = this.model.attributes,
          el = this.$el,
          tables = [],
          username = this.options.username;

      el.html(InfoTemplate);

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
    }
  });

  return InfoView;
});
