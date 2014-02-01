/*global $, require, NProgress, isMobile*/

//Game Container
var GameContainer = require('./GameContainer');
//Snake Game
var Snake = require('./Snake');


var app = {

  menuOpen : false,

  game : new GameContainer({ inst : new Snake(), explosion : true}),

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
      if (++count >= toload) cb();
    }
  },

  bindEvents : function () {
    if (this.game.started) {
      $(window)
        .focus(this.game.play.bind(this.game))
        .blur(this.game.pause.bind(this.game));
    }
    $('.js-menu-toggle').on('click', this.toggleMenu);
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
    var menu = $('#menu');
    if (this.menuOpen) {
      menu.slideUp();
    } else {
      menu.slideDown();
    }
    this.menuOpen = !this.menuOpen;
  },

  ifMobile : function() {
    $('#menu').addClass('mobile');
  }
};

//On Document Ready PreLoad Images
$(document).ready(function () {
  var images = ['/assets/img/bg.jpg'];
  images.push('/assets/img/mobile-sprite.png');

  //Is Mobile Device?
  if (isMobile.any) {
    app.ifMobile();
  }

  app.preloadImages(images, function () {
    app.start();
  });
});

module.exports = app;