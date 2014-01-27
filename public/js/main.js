/*global $, require, NProgress*/

//Snake Game Container
var Snake = require('./Snake');


var app = {

  menuOpen : false,

  snake : new Snake(),

  start : function () {
    this.snake.start();
    this.bindEvents();
    this.shuffleHeader();
    NProgress.done();
  },

  shuffleHeader : function() {
    $('.intro h1').shuffleLetters({ fps  : 20});
  },

  toggleMenu : function () {
    $('#menu').slideToggle();
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
  app.start();
});