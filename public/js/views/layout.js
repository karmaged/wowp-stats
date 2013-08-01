'use strict';

define([
  'jquery',
  'underscore',
  'backbone',
  'vm',
  'pos',
  'models/user',
  'text!templates/layout.html',
  'views/info',
  'swiffy',
  'loader'
], function ($, _, Backbone, Vm, pos, UserModel, LayoutTemplate, InfoView) {
  var LayoutView = Backbone.View.extend({
    el: '.application',
    model: new UserModel(),
    render: function() {
      var el = this.$el,
          loaderObj, loader, form;

      el.html(LayoutTemplate);

      this.form = form = el.find('.search-form');
      this.loader = loader = el.find('.loader');

      loaderObj = new swiffy.Stage(loader[0], loaderJSON);
      loaderObj.start();

      form.fadeIn(500);
      pos([form, loader]);

      form.find('input').focus();

      $(window).bind('resize', function() {
        pos([form, loader]);
      });
    },
    events: {
      'submit .search-form': 'submit',
      'submit .search-small': 'submit'
    },
    get: function (username) {
      var self = this;

      this.model.fetch({
        success: function () {
          self.build(username);
        },
        error: function() {
          self.onerror();
        }
      });
    },
    build: function (username) {
      var self = this;
      var infoView = Vm.create({}, 'InfoView', InfoView, {model: this.model, username: username});

      setTimeout(function() {
        setTimeout(function() {
          infoView.render();
        }, 200);

        self.loader.fadeOut(100);
        self.form.find('input').val('');
      }, 500);
    },
    onerror: function() {
      var form = this.form,
          loader = this.loader,
          input = this.$el.find('.search-form input');

      input.val('');
      input[0].placeholder = 'такого пользователя нет в системе';
      loader.fadeOut(100, function() {
        form.fadeIn(100);
        pos([form, loader]);
      });
    },
    submit: function (e) {
      e.preventDefault();

      var form = $(e.target),
          loader = this.loader,
          info = this.$el.find('.info'),
          type = form.hasClass('search-small'),
          input = this.input = form.find('input'),
          toFadeOut = form,
          self = this,
          username;

      if (!!type) {
        toFadeOut = info;
      }

      if (input.val().length === 0) {
        input[0].placeholder = 'введите имя пользователя';
      } else {
        username = input.val().replace(/\W/g, '');
        toFadeOut.fadeOut(100, function() {
          loader.fadeIn(100);
          pos([form, loader]);
        });

        this.model.getURL(username);

        if (!localStorage.getItem('wowp_stats_'+username+'')) {
          this.get(username);
        } else {
          var json = JSON.parse(localStorage.getItem('wowp_stats_'+username+'')).data;

          if ((new Date().getTime() - json.timestamp) >= 86400000) {
            this.get(username);
          } else {
            this.model.attributes = json;

            this.build(username);
          }
        }
      }
    }
  });

  return LayoutView;
});
