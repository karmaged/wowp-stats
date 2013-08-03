'use strict';

define([
  'jquery',
  'underscore',
  'backbone'
], function ($, _, Backbone) {
  var SometerView = Backbone.View.extend({
    el: '.someter',
    render: function() {
      var data = this.options,
          names = ['Количество боёв', 'Процент побед', 'Средний опыт за бой'],
          classname = '';

      for (var item in data) {
        data[item] = data[item].toString();
        if (data[item].length > 3) {
          classname = 'small';
        }
      }

      this.$el.append('<li class="item"><span class="label">'+names[0]+'</span><span class="value '+classname+'">'+data.played+'</span></li>')
      this.$el.append('<li class="item"><span class="label">'+names[1]+'</span><span class="value '+classname+'">'+data.win_p+'</span></li>')
      this.$el.append('<li class="item"><span class="label">'+names[2]+'</span><span class="value '+classname+'">'+data.avg_exp+'</span></li>')
      this.$el.append('<div class="clear"></div>')
    }
  });

  return SometerView;
});
