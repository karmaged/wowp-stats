'use strict';
define([
  'jquery',
  'underscore',
  'backbone'
], function ($, _, Backbone) {
  var UserModel = Backbone.Model.extend({
    initialize: function() {

    },
    getURL: function (username) {
      this.url = '/user-info?type=full&username='+username+''
    }
  });

  return UserModel;
});
