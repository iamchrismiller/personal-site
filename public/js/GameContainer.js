/*global module, require, $, Hammer */

var cookie = require('./util/cookie');

/**
 * Basic Game Object
 * @param options
 * @constructor
 */
var GameContainer = function (options) {
  this.started = false;
  this.disabled = false;
  this.score = 0;
  this.settings = $.extend({
    inst : false
  }, options);

  this.inst = this.settings.inst;
  if (!this.inst) {
    throw new Error("A Game Instance Must Be Supplied");
  }

  this.$canvas = this.inst.$canvas;
  this.$scoreboard = $('#scoreboard');
  this.updateScoreboard();
  this.bindEvents();
};


GameContainer.prototype.start = function () {
  this.started = true;
  this.inst.start();
};

GameContainer.prototype.bindEvents = function () {
  var self = this;
  $(document).on('keydown', this.onKeydown.bind(this));
  $(window).on('resize', this.onResize.bind(this));
  this.bindTouchEvents();

  this.inst.onRestart = function (score) {
    self.onGameRestart(score);
  };

  this.inst.onScore = function (score) {
    self.onGameScore(score);
  };
};

GameContainer.prototype.play = function () {
  this.started = true;
  this.inst.play();
};

GameContainer.prototype.pause = function () {
  this.started = false;
  this.inst.pause();
};

GameContainer.prototype.enableGame = function () {
  this.disabled = false;
  this.$canvas.show();
  this.play();
};

GameContainer.prototype.disableGame = function () {
  this.disabled = true;
  this.$canvas.hide();
  this.pause();
};

GameContainer.prototype.saveGame = function (score) {
  var hiScore = cookie.read(this.inst.name + '_user') || 0;
  if (this.inst.bot && this.inst.bot.enabled) {
    var botScore = cookie.read(this.inst.name + '_bot') || 0;
    if (botScore && score < botScore) {
      score = botScore;
    }
    cookie.create(this.inst.name + '_bot', score);
  } else if (!hiScore || (hiScore && score > hiScore)) {
    cookie.create(this.inst.name + '_user', score);
  }
};

GameContainer.prototype.updateScoreboard = function (score) {
  this.updateScore(score || 0);

  this.$scoreboard.find('#hi-score span')
    .text(cookie.read(this.inst.name + '_user') || 0);

  if (this.inst.bot) {
    this.$scoreboard.find('#bot-hi-score span')
      .text(cookie.read(this.inst.name + '_bot') || 0);
  }
};

GameContainer.prototype.updateScore = function (score) {
  var $score = this.$scoreboard.find('#score span');
  $score.text(score).addClass('flash');
  setTimeout(function () {
    $score.removeClass('flash');
  }, 1000)
};

GameContainer.prototype.onKeydown = function (event) {
  switch (event.keyCode) {
    case 38 :
      this.inst.queueDirection(this.inst.DIRECTIONS.UP);
      break;
    case 40 :
      this.inst.queueDirection(this.inst.DIRECTIONS.DOWN);
      break;
    case 37 :
      this.inst.queueDirection(this.inst.DIRECTIONS.LEFT);
      break;
    case 39 :
      this.inst.queueDirection(this.inst.DIRECTIONS.RIGHT);
      break;
    case 98 : //b
      if (this.inst.bot) {
        this.inst.bot.enable();
      }
      break;
    case 82 : //r
      this.inst.restart();
      break;
    case 79 : //o
      this.toggleGame();
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

GameContainer.prototype.bindTouchEvents = function() {
  var self = this;

  $(document).on('touchmove', function(e) {
    e.preventDefault();
  });

  //  Hammer(body).on("hold", function(event) { console.log("hold");});

  Hammer(body).on("doubletap", function(e) {
    self.inst.restart();
  });
  Hammer(body).on("swipeup", function(e) {
    self.inst.queueDirection(self.inst.DIRECTIONS.UP);
  });
  Hammer(body).on("swipedown", function(e) {
    self.inst.queueDirection(self.inst.DIRECTIONS.DOWN);
  });
  Hammer(body).on("swipeleft", function(e) {
    self.inst.queueDirection(self.inst.DIRECTIONS.LEFT);
  });
  Hammer(body).on("swiperight", function(e) {
    self.inst.queueDirection(self.inst.DIRECTIONS.RIGHT);
  });
};

GameContainer.prototype.onGameScore = function (score) {
  this.updateScore(score);
};

GameContainer.prototype.onGameRestart = function (score) {
  this.saveGame(score);
  this.updateScoreboard();
};

GameContainer.prototype.toggleGame = function () {
  if (this.disabled) {
    this.enableGame();
  } else {
    this.disableGame();
  }
};

GameContainer.prototype.onResize = function () {
  if (typeof this.inst.onResize === 'function') {
    this.inst.onResize(window.innerHeight, window.innerWidth);
  }
};

module.exports = GameContainer;