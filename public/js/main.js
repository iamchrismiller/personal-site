/*global $, require, NProgress*/

//Snake Game Container
var Snake = require('./Snake');


var app = {

  menuOpen : false,

  snake : new Snake(),

  start : function () {
    NProgress.done();
    this.bindEvents();
    this.shuffleHeader();

    setTimeout(function() {
      app.snake.start();
    }, 3000);
  },

  shuffleHeader : function() {
    $('.intro h1').shuffleLetters({ fps  : 20});
  },

  toggleMenu : function () {
    $('#menu').slideToggle();
  },

  preloadImages : function(obj, cb) {
      var loaded = 0;
      var toload = 0;
      var images = obj instanceof Array ? [] : {};

      for (var i in obj) {
        toload++;
        images[i] = new Image();
        images[i].src = obj[i];
        images[i].onload = load;
        images[i].onerror = load;
        images[i].onabort = load;
      }

      function load() {
        if (++loaded >= toload) cb();
      }
  },

  bindEvents : function () {
    $(window).focus(this.snake.play).blur(this.snake.pause);

    $('.js-menu').on('click', function () {
      app.toggleMenu();
    });

    $(window).on('keydown', function (e) {
      switch (e.keyCode) {
        case 82 : //r
          app.snake.restart();
          break;
        case 191 : //?
          app.toggleMenu();
          break;
      }
    });
  }
};


$(document).ready(function() {
  app.preloadImages(['/assets/img/bg.jpg'], function() {
    app.start();
  });
});