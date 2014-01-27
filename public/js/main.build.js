(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

/**
 * Pseudo Particle Class
 */
function Particle(options) {
  this.options = options || {};
  this.x = this.options.x;
  this.y = this.options.y;

  this.radius = parseInt(Math.random() * 5);
  this.color = this.getBWHex();

  this.velocity = {
    x : -8 + Math.random() * 10,
    y : -8 + Math.random() * 10
  };
}

Particle.prototype.getBWHex = function () {
  return '#' + ((!(Math.random()+ 0.5 | 0) === true) ? 'FFFFFF' : '000000');
};

Particle.prototype.getColor = function() {
  return '#' + (Math.random() * 0xFFFFFF << 0).toString(16);
};


Particle.prototype.draw = function (context) {
  context.fillStyle = this.color;
  context.beginPath();
  context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
  context.fill();
  context.closePath();
};

module.exports = Particle;
},{}],2:[function(require,module,exports){
/*global requestAnimationFrame, module, require, $ */

var Particle = require('./Particle');
var cookie = require('./util/cookie');

//DOM CANVAS GLOBALS
var $canvas = $("#canvas");
var canvas = $canvas[0];
var context = canvas.getContext('2d');
var canvasWidth = canvas.width = window.innerWidth;
var canvasHeight = canvas.height= window.innerHeight;
$canvas.css({width : window.innerWidth, height : window.innerHeight});
var animationTimeout;

//Global Particles For Explosions
var particles = [];
var particleCount = 150;
var gravity = 1;
//move into snake class
var fpsDefault = 15;
var fps = fpsDefault;

/**
 * Snake Game
 * @param options
 * @constructor
 */
var Snake = function(options) {

  this.score = 0;
  this.started = false;

  this.surround = false;

  this.snakePieces = [];
  this.snakeFood = [];

  this.settings = $.extend({
    snakePixels    : 14,
    snakeSize      : 3,
    bot            : true
  }, options);

  this.bot = {};

  if (this.settings.bot) {
    this.enableBot();
  }

  this.DIRECTIONS = {
    UP   : 0,
    DOWN : 2,
    LEFT  : 3,
    RIGHT : 1
  };

  this.direction = this.DIRECTIONS.RIGHT;
  this.dQueue = [];

  this.bindEvents();
};


Snake.prototype.start = function() {
  this.started = true;
  this.create();
  this.createFood();
  this.play();
};

Snake.prototype.reset = function() {
  this.started = false;
  this.score = 0;
  this.dQueue = [];
  this.direction = this.DIRECTIONS.RIGHT;
  this.snakePieces = [];
  this.snakeFood = [];
  fps = fpsDefault;

  if (animationTimeout) {
    clearTimeout(animationTimeout);
  }
};

Snake.prototype.restart = function () {
  this.saveGame();
  this.reset();
  this.start();
};


Snake.prototype.bindEvents = function() {
  $(document).keydown(this.keydown.bind(this));
  $(window).on('resize', this.onResize.bind(this));
};

Snake.prototype.play = function() {
  this.started = true;
  if (typeof this.animationLoop === 'function') {
    this.animationLoop();
  }
};


Snake.prototype.pause = function() {
  this.started = false;
};


Snake.prototype.lose = function() {
  this.pause();

  setTimeout(function() {
    this.restart();
  }.bind(this), 2000);

};

Snake.prototype.saveGame = function() {
  var hiScore = cookie.get('hi-score');
  var score = this.score;
  if (this.bot.enabled) {
    var botScore = cookie.get('bot-score');
    if (botScore && this.score < botScore) {
      score = botScore;
    }
    cookie.set('bot-score', score);
  } else if (!hiScore || (hiScore && this.score < hiScore)) {
    score = hiScore ? hiScore : this.score;
    cookie.set('hi-score', score);
  }
};

Snake.prototype.keydown = function (e) {
  var direction;

  //Keys For Gameplay
  var gameKeys = [38,40,37,39];

  if (this.bot && gameKeys.indexOf(e.keyCode) !== -1) {
    this.disableBot();
  }

  switch (e.keyCode) {
    case 38 :
      direction = this.DIRECTIONS.UP;
      break;
    case 40 :
      direction = this.DIRECTIONS.DOWN;
      break;
    case 37 :
      direction = this.DIRECTIONS.LEFT;
      break;
    case 39 :
      direction = this.DIRECTIONS.RIGHT;
      break;
    case 66 : //b
      this.enableBot();
      break;
    case 32 : //space
      if (this.started) {
        this.pause();
      } else {
        this.play();
      }
      return;
    default :
      return;
  }

  //Don't Allow The Same Moves To Stack Up
  if (this.started && this.dQueue[this.dQueue.length - 1] !== direction) {
    this.dQueue.push(direction);
  }
};

Snake.prototype.onResize = function() {
  var height = window.innerHeight;
  var width = window.innerWidth;

  canvasWidth = width;
  canvas.width = width;
  canvasHeight = height;
  canvas.height = height;

  $canvas.css({width : width, height : height});
};


Snake.prototype.create = function() {
  for (var x = 0; x < this.settings.snakeSize; x++) {
    this.snakePieces.push({ x : 0, y : 20 });
  }
};

Snake.prototype.createFood = function() {
  this.snakeFood.push({
    x : Math.round(Math.random() * (canvasWidth - this.settings.snakePixels) / this.settings.snakePixels),
    y : Math.round(Math.random() * (canvasHeight - this.settings.snakePixels) / this.settings.snakePixels)
  });
};


Snake.prototype.drawLoop = function() {
  //Clear Canvas Context Defore Redraw
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.clearRect(0, 0, canvas.width, canvas.height);

  var headX = this.snakePieces[0].x;
  var headY = this.snakePieces[0].y;

  var direction = this._getDirection();
  //reset direction
  this.direction = direction;

  if (this.bot) {
    if (this.bot.enabled) {
      this.direction = this.getNextMove();
    }
  }

  switch(this.direction) {
    case this.DIRECTIONS.RIGHT:
      headX++;
      break;
    case this.DIRECTIONS.LEFT:
      headX--;
      break;
    case this.DIRECTIONS.DOWN:
      headY++;
      break;
    case this.DIRECTIONS.UP:
      headY--;
      break;
  }

  if (this.isWallCollision(headX, headY)) {
    this.lose();
  }

  if (this.isSelfCollision(headX, headY)) {
    this.lose();
  }
  
  var snakeTail = {};

  if (this.started) {
    if (this.isFoodCollision(headX, headY)) {
      this.score++;

      //Increase FramesPerSecond Each Multiple of 8
      if (this.score % 2) {
        fps += 0.5;
      }

      this.removeFoodIfExists(headX, headY);
      this.createExpolosion(headX, headY);
      this.createFood();

      snakeTail.x = headX;
      snakeTail.y = headY;
    } else {
      //Pop head tail to become new  head
      snakeTail = this.snakePieces.pop();
      snakeTail.x = headX;
      snakeTail.y = headY;
    }

    //move snakeTail to snakeHead
    this.snakePieces.unshift(snakeTail);
  }

  this.drawSnake();
  this.drawFood();
  this.drawScoreboard();
};

Snake.prototype._getDirection = function () {
  var direction;
  while (typeof direction === 'undefined' || (this.direction - direction + 4) % 4 == 2) {
    if (this.dQueue.length > 0) {
      //Shift through the Queue
      direction = this.dQueue.shift();
    }
    else {
      direction = this.direction;
    }
  }
  return direction;
};


Snake.prototype.isWallCollision = function(x,y) {
  var isTopCollision = y === -1,
    isRightCollision = x >= canvasWidth / this.settings.snakePixels,
    isBottomCollision = y >= canvasHeight / this.settings.snakePixels,
    isLeftCollision = x === -1;

  return isTopCollision || isRightCollision  || isBottomCollision || isLeftCollision;
};

Snake.prototype.isSelfCollision = function(x,y) {
  for (var i = 0; i < this.snakePieces.length; i++) {
    if (this.snakePieces[i].x == x && this.snakePieces[i].y == y) {
      return true;
    }
  }
  return false;
};

Snake.prototype.isFoodCollision = function(x,y) {
  var found = false;
  this.snakeFood.forEach(function(food) {
    if ((x == food.x && y == food.y)) {
      found = true;
    }
  });
  return found;
};

Snake.prototype.removeFoodIfExists = function(x,y) {
  var self = this;
  this.snakeFood.forEach(function(food,ix) {
    if ((x == food.x && y == food.y)) {
      self.snakeFood.splice(ix);
    }
  });
};


Snake.prototype.drawScoreboard = function() {
  this.drawScore();
};

Snake.prototype.drawScore = function() {
  context.font = "20px 'HelveticaNeue-Light','Helvetica Neue Light','Helvetica Neue', Helvetica, sans-serif";
  context.fillText("Score: " + this.score, canvasWidth - 110,  canvasHeight - 10);
  context.fillText("Hi-Score: " + (cookie.get('hi-score') || 0), canvasWidth - 250,  canvasHeight - 10);
  context.fillText("Bot-Score: " + (cookie.get('bot-score') || 0), canvasWidth - 410,  canvasHeight - 10);
};


Snake.prototype.drawSnake = function() {
  for (var i = 0; i < this.snakePieces.length; i++) {
    var x = this.snakePieces[i];
    this.drawPart(x.x, x.y);
  }
};

Snake.prototype.drawFood = function(x,y) {
  var width = this.settings.snakePixels;
  context.fillStyle = "#ffffff";
  context.strokeStyle = "#000000";

  this.snakeFood.forEach(function(food) {
    context.fillRect(food.x * width, food.y * width, width, width);
    context.strokeRect(food.x * width, food.y * width, width, width);
  });
};


Snake.prototype.drawPart = function(x,y) {
  var width = this.settings.snakePixels;
  context.fillStyle = "#ffffff";
  context.strokeStyle = "#000000";
  context.fillRect(x * width, y * width, width, width);
  context.strokeRect(x * width, y * width, width, width);
};

Snake.prototype.createExpolosion = function(x,y) {
  for (var i = 0; i < particleCount; i++) {
    var particle = new Particle({x : x * this.settings.snakePixels, y : y * this.settings.snakePixels});
    particles.push(particle);
  }
};

Snake.prototype.animationLoop = function() {
  if (this.started) {
    var self = this;

    if (animationTimeout) {
      clearTimeout(animationTimeout);
    }

    //Ensure FPS
    animationTimeout = setTimeout(function() {
      self.drawLoop.call(self);
      self.particleLoop.call(self);
      window.requestAnimationFrame(self.animationLoop.bind(self));
    }, 1000 / fps);
  }
};

Snake.prototype.particleLoop = function() {
  if (particles) {
    particles.forEach(function(particle,ix) {
      //Apply Some Gravity
      particle.velocity.y += gravity;
      //Now Come Velocity
      particle.x += particle.velocity.x;
      particle.y += particle.velocity.y;
      particle.draw(context);
      if (particle.y > canvasHeight) {
        particles.splice(ix);
      }
    });
  }
};


Snake.prototype.enableBot = function() {
  this.bot.enabled = true;
};

Snake.prototype.disableBot = function() {
  this.bot.enabled = false;
};

Snake.prototype.isSafeMove = function(snakePos, direction) {
  //Make Sure you are only able to go perpendicular direction
  if (Math.abs(this.direction - direction) === 2) return false;

  switch (direction) {
    case this.DIRECTIONS.UP :
      snakePos.y--;
      break;
    case this.DIRECTIONS.DOWN :
      snakePos.y++;
      break;
    case this.DIRECTIONS.RIGHT :
      snakePos.x++;
      break;
    case this.DIRECTIONS.LEFT :
    default:
      snakePos.x--;
  }

  var isSafe = true;
  this.snakePieces.forEach(function(piece) {
    if (piece.x === snakePos.x && piece.y === snakePos.y) {
      isSafe = false;
    }
  });
  return isSafe;
};

Snake.prototype.getPrelimDirection = function (snake, food) {
  var xdiff = Math.abs(snake.x - food.x);
  var ydiff = Math.abs(snake.y - food.y);

  if (xdiff > ydiff) {
    //if snake is above food
    return snake.x > food.x ? this.DIRECTIONS.LEFT : this.DIRECTIONS.RIGHT;
  }
  //if food is below snake or snake is at top of screen
  return snake.y < food.y || snake.y === 0 ? this.DIRECTIONS.DOWN : this.DIRECTIONS.UP;
};


Snake.prototype.getNextMove = function() {
  var snakeFood = this.snakeFood[0];
  var head = {
    x : this.snakePieces[0].x,
    y : this.snakePieces[0].y
  }
  var tries = 0;
  var direction = this.getPrelimDirection(head, snakeFood);
  //test preliminary move
  while (!this.isSafeMove(head, direction) && tries++ <= 4) {
    direction = (direction + 1) % 4;
  }
  return direction;
};


module.exports = Snake;
},{"./Particle":1,"./util/cookie":4}],3:[function(require,module,exports){
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
},{"./Snake":2}],4:[function(require,module,exports){
/*global module*/

module.exports = {

  set : function (name, value, days) {
    var d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toGMTString();
    document.cookie = name + "=" + value + "; " + expires;
  },

  get : function (name) {
    name = name + "=";
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
      var cookie = cookies[i].trim();
      if (cookie.indexOf(name) === 0) {
        return cookie.substring(name.length, cookie.length);
      }
    }
    return false;
  }
};
},{}]},{},[3])