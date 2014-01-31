/*global requestAnimationFrame, module, require, $ */

var cookie = require('./util/cookie');

/**
 * Basic Game Object
 * @param options
 * @constructor
 */
var Game = function (options) {
  this.started = false;
  this.disabled = false;
  this.score = 0;
  this.settings = $.extend({
    inst : false
  }, options);

  this.inst = this.settings.inst;
  //Game Instance
  if (!this.inst) {
    throw new Error("A Game Instance Must Be Supplied");
  }

  this.$canvas = this.inst.$canvas;
  this.$scoreboard = $('#scoreboard');
  this.updateScoreboard();
  this.bindEvents();
};


Game.prototype.start = function () {
  this.started = true;
  this.inst.start();
};

Game.prototype.bindEvents = function () {
  var self = this;
  $(document).on('keydown', this.onKeydown.bind(this));
  $(window).on('resize', this.onResize.bind(this));

  this.inst.onRestart = function (score) {
    self.onGameRestart(score);
  };

  this.inst.onScore = function (score) {
    self.onGameScore(score);
  };
};

Game.prototype.play = function () {
  this.started = true;
  this.inst.play();
};

Game.prototype.pause = function () {
  this.started = false;
  this.inst.pause();
};

Game.prototype.enableGame = function () {
  this.disabled = false;
  this.$canvas.show();
  this.play();
};

Game.prototype.disableGame = function () {
  this.disabled = true;
  this.$canvas.hide();
  this.pause();
};

Game.prototype.saveGame = function (score) {
  var hiScore = cookie.get(this.inst.name + '_user') || 0;
  if (this.inst.bot && this.inst.bot.enabled) {
    var botScore = cookie.get(this.inst.name + '_bot') || 0;
    if (botScore && score < botScore) {
      score = botScore;
    }
    cookie.set(this.inst.name + '_bot', score);
  } else if (!hiScore || (hiScore && score > hiScore)) {
    cookie.set(this.inst.name + '_user', score);
  }
};

Game.prototype.updateScoreboard = function (score) {
  this.updateScore(score || 0);

  this.$scoreboard.find('#hi-score span')
    .text(cookie.get(this.inst.name + '_user') || 0);

  if (this.inst.bot) {
    this.$scoreboard.find('#bot-hi-score span')
      .text(cookie.get(this.inst.name + '_bot') || 0);
  }
};

Game.prototype.updateScore = function (score) {
  var $score = this.$scoreboard.find('#score span');
  $score.text(score).addClass('flash');
  setTimeout(function () {
    $score.removeClass('flash');
  }, 1000)
};

Game.prototype.onKeydown = function (event) {
  switch (event.keyCode) {
    case 79 : //o
      this.toggleGame();
      break;
    case 82 : //r
      this.inst.restart();
      break;
    case 32 : //space
      if (!this.disabled) {
        if (this.started) {
          this.pause();
        } else {
          this.play();
        }
      }
      break;
  }
};

Game.prototype.onGameScore = function (score) {
  this.updateScore(score);
};

Game.prototype.onGameRestart = function (score) {
  this.saveGame(score);
  this.updateScoreboard();
};

Game.prototype.toggleGame = function () {
  if (this.disabled) {
    this.enableGame();
  } else {
    this.disableGame();
  }
};

Game.prototype.onResize = function () {
  if (typeof this.inst.onResize === 'function') {
    this.inst.onResize(window.innerHeight, window.innerWidth);
  }
};

module.exports = Game;