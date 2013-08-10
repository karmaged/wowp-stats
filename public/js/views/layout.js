'use strict';

define([
  'jquery',
  'underscore',
  'backbone',
  'vm',
  'cookie',
  'pos',
  'models/user',
  'text!templates/layout.html',
  'views/info',
  'events',
  'swiffy',
  'loader'
], function ($, _, Backbone, Vm, cookie, pos, UserModel, LayoutTemplate, InfoView, vent) {
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

      if (!!$.cookie('wowp_username')) {
        this.submit(null, $.cookie('wowp_username'));
      } else {
        form.fadeIn(500);
      }

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
      var compare = $('.btn.compare').hasClass('active');
      var update = false;

      if (!!compare) {
        if (!!$('.section-compare').hasClass('active')) {
          update = true;
        }
        setTimeout(function() {
          setTimeout(function() {
            vent.trigger('compare', {model: self.model, username: username, update: update});
          });

          self.loader.fadeOut(100);
          $('.search-small input').val('');
        }, 500);
      } else {
        var infoView = Vm.create({}, 'InfoView', InfoView, {model: this.model, username: username});

        setTimeout(function() {
          setTimeout(function() {
            infoView.render();
          }, 200);

          self.loader.fadeOut(100);
          self.form.find('input').val('');
        }, 500);
      }
    },
    onerror: function() {
      var form = this.form,
          loader = this.loader,
          input,
          self = this;

      if (!!this.type) {
        form = $('.info');
      }
      input = form.find('input');
      input.val('');
      input[0].placeholder = 'такого пользователя нет в системе';
      loader.fadeOut(100, function() {
        form.fadeIn(100);
        if (!self.type) {
          pos([form, loader]);
        }
      });
    },
    submit: function (e, username) {
      var back, form, type, input, value, toFadeOut, compare;

      if (e !== null) {
        e.preventDefault();

        form = $(e.target);
        this.type = type = form.hasClass('search-small');
        compare = $('.btn.compare').hasClass('active');
        input = this.input = form.find('input');
        value = input.val().length;
        toFadeOut = form;
      } else {
        back = true;
        value = 1;
      }

      var loader = this.loader,
          info = this.$el.find('.info'),
          username;

      if (!!type) {
        toFadeOut = info;
      }

      if (value === 0) {
        input[0].placeholder = 'введите имя пользователя';
      } else {
        if (!back) {
          username = input.val().replace(/\W/g, '');
          if (!!compare) {
            loader.fadeIn(100);
            pos([form, loader]);
          } else {
            toFadeOut.fadeOut(100, function() {
              loader.fadeIn(100);
              pos([form, loader]);
            });
          }
        } else {
          loader.fadeIn(100);
        }

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
        $.cookie('wowp_username', username, {expires: new Date(Date.now() + 2592000000)});
      }
    }
  });

  return LayoutView;
});
