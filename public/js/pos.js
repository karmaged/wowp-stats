'use strict';
define([

], function() {
  var Pos = function pos (els) {
    for (var i = 0; i < els.length; i++) {
      var el = els[i];

      el[0].style.top = (window.innerHeight - el[0].clientHeight) / 2 + 'px';
      el[0].style.left = (window.innerWidth - el[0].clientWidth) / 2 + 'px';
    }
  };

  return Pos;
});
