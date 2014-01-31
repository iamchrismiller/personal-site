/*global $, require, NProgress*/

//Game Runner
var Game = require('./Game');
//Snake Game Container
var Snake = require('./Snake');


var app = {

  menuOpen : false,

  game : new Game({ inst : new Snake()}),

  start : function () {
    NProgress.done();
    this.bindEvents();

    setTimeout(function () {
      app.game.start();
    }, 3000);
  },

  preloadImages : function (obj, cb) {
    var count = 0,
      toload = 0,
      images = obj instanceof Array ? [] : {};

    for (var i in obj) {
      images[i] = new Image();
      images[i].src = obj[i];

      images[i].onload = loaded;
      images[i].onerror = loaded;
      images[i].onabort = loaded;
      toload++;
    }

    function loaded() {
      if (++count <= toload) cb();
    }
  },

  bindEvents : function () {
    $(window)
      .focus(this.game.play.bind(this.game))
      .blur(this.game.pause.bind(this.game));

    $('.js-menu').on('click', this.toggleMenu);
    $(window).on('keydown', this.onKeydown);
  },

  onKeydown : function (event) {
    switch (event.keyCode) {
      case 191 : //?
        app.toggleMenu();
        break;
    }
  },

  toggleMenu : function () {
    $('#menu').slideToggle();
  }
};

//On Document Ready PreLoad Images
$(document).ready(function () {
  var images = ['/assets/img/bg.jpg'];
  app.preloadImages(images, function () {
    app.start();
  });
});