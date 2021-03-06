'use strict';

require.config({
  shim: {
    'underscore': {
      exports: '_'
    },
    'backbone': {
      deps: [
        'jquery',
        'underscore'
      ],
      exports: 'Backbone'
    },
    'backstretch': {
      deps: [
        'jquery'
      ],
      exports: 'Backstretch'
    },
    'cookie': {
      deps: [
        'jquery'
      ],
      exports: 'Cookie'
    }
  },
  paths: {
    'jquery': '../components/jquery/jquery',
    'backstretch': '../components/jquery-backstretch/jquery.backstretch',
    'underscore': '../components/underscore-amd/underscore',
    'backbone': '../components/backbone-amd/backbone',
    'cookie': '../components/jquery.cookie/jquery.cookie',
    'swiffy': './swiffy',
    'loader': './loader',

    'text': '../components/requirejs-text/text',

    'templates': './templates',
    'models': './models'
  }
});

require([
  'jquery',
  'backstretch',
  'vm',
  'views/layout'
], function ($, backstretch, Vm, LayoutView) {
  $.backstretch('img/bg.jpg');

  var layoutView = Vm.create({}, 'LayoutView', LayoutView);

  layoutView.render();
});
