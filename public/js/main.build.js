(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**global $*/

/**
 * Semi Stupid Automated Bot
 * Used For 2d Plane
 * @param options
 * @constructor
 */
function Bot(options) {
  this.options = $.extend({
    enabled    : false,
    //perpendicular checking
    directions : {
      UP    : 0,
      DOWN  : 2,
      LEFT  : 1,
      RIGHT : 3
    }
  }, options);

  this.enabled = this.options.enabled;
}

Bot.prototype.enable = function () {
  this.enabled = true;
};

Bot.prototype.disable = function () {
  this.enabled = false;
};

Bot.prototype.getNextMove = function (obj, attractor, objPos, currentDir, directions) {
  var tries = 0;
  var head = {
    x : obj[0].x,
    y : obj[0].y
  };

  var direction = this.getPrelimDirection(head, attractor, directions);
  //test preliminary move
  while (!this.isSafeMove(obj, head, currentDir, direction, directions) && tries++ <= 4) {
    direction = (direction + 1) % 4; //0-3
  }
  return direction;
};

Bot.prototype.getPrelimDirection = function (obj, attractor, directions) {
  //is object closer to x
  if (Math.abs(obj.x - attractor.x) > Math.abs(obj.y - attractor.y)) {
    //if object is above the attractor
    return obj.x > attractor.x ? directions.LEFT : directions.RIGHT;
  }
  //if object is below attractor or object is at top of screen
  return obj.y < attractor.y || obj.y === 0 ? directions.DOWN : directions.UP;
};


Bot.prototype.isSafeMove = function (snake, head, currentDirection, newDirection, directions) {
  //Make Sure you are only able to go perpendicular direction
  if (Math.abs(currentDirection - newDirection) === 2) return false;

  switch (newDirection) {
    case directions.UP :
      head.y--;
      break;
    case directions.DOWN :
      head.y++;
      break;
    case directions.RIGHT :
      head.x++;
      break;
    case directions.LEFT :
    default:
      head.x--;
  }

  var isSafe = true;
  snake.forEach(function (piece) {
    if (piece.x === head.x && piece.y === head.y) {
      isSafe = false;
    }
  });
  return isSafe;
};


module.exports = Bot;
},{}],2:[function(require,module,exports){

/**
 * Food Class
 * Creating a simple 2d object
 * with an inner color and a border
 */
function Food(options) {
  this.options = options || {};
  this.width = this.options.width ? this.options.width : 10;
  this.x = this.options.x ? this.options.x : 0;
  this.y = this.options.y ? this.options.y : 0;
  this.color = this.options.color || '#000';
  this.border = this.options.border || '#FFF';
}

/**
 * Draw Food To Canvas
 * @param context
 */
Food.prototype.draw = function (context) {
  context.fillStyle = this.color;
  context.strokeStyle = this.border;
  context.fillRect(this.x * this.width, this.y * this.width, this.width, this.width);
  context.strokeRect(this.x * this.width, this.y * this.width, this.width, this.width);
};

module.exports = Food;
},{}],3:[function(require,module,exports){
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
},{"./util/cookie":8}],4:[function(require,module,exports){

/**
 * Pseudo Particle Class
 */
function Particle(options) {
  this.options = options || {};
  this.x = this.options.x;
  this.y = this.options.y;

  this.life = 100;
  this.velocity = {
    x : -5 + Math.random() * 10,
    y : -8 + Math.random() * 10
  };
  this.radius = parseInt(Math.random() * 5);
  this.color = ((!(Math.random()+ 0.5 | 0) === true) ? 255 : 0);
}

Particle.prototype.getColor = function() {
  return '#' + (Math.random() * 0xFFFFFF << 0).toString(16);
};


Particle.prototype.draw = function (context) {
  //decay
  this.life = ~~(this.life *.96);
  this.radius = (this.radius *.96);

  context.fillStyle = ('rgba(' + this.color + ',' + this.color + ',' + this.color + ", " + this.life / 100);
  context.beginPath();
  context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
  context.fill();
  context.closePath();
};

module.exports = Particle;
},{}],5:[function(require,module,exports){

/**
 * Piece Class
 * Creating a simple 2d object
 * with an inner color and a border
 */
function Piece(options) {
  this.options = options || {};
  this.width = this.options.width ? this.options.width : 10;
  this.x = this.options.x ? this.options.x : 0;
  this.y = this.options.y ? this.options.y : 0;
  this.color = this.options.color || '#FFF';
  this.border = this.options.border || '#000';
}

/**
 * Basic Position Updater
 * @param x
 * @param y
 */
Piece.prototype.updatePosition = function(x,y) {
  this.x = x;
  this.y = y;
}

/**
 * Draw Piece To Canvas
 * @param context
 */
Piece.prototype.draw = function (context) {
  context.fillStyle = this.color;
  context.strokeStyle = this.border;
  context.fillRect(this.x * this.width, this.y * this.width, this.width, this.width);
  context.strokeRect(this.x * this.width, this.y * this.width, this.width, this.width);
};


module.exports = Piece;
},{}],6:[function(require,module,exports){
/*global requestAnimationFrame, module, require, $ */

var Particle = require('./Particle');
var Piece = require('./Piece');
var Food = require('./Food');
var Bot = require('./Bot');

/**
 * Snake Game
 * @param options
 * @constructor
 */
var Snake = function(options) {

  this.name = "snake";
  this.score = 0;
  this.started = false;
  this.fps = 15;

  this.gravity = 1;
  this.particles = [];
  this.particleCount = 150;

  this.$canvas = $("canvas");
  this.canvas = this.$canvas[0];
  this.context = this.canvas.getContext('2d');
  this.canvas.width = window.innerWidth;
  this.canvas.height = window.innerHeight;
  this.animationTimeout = null;

  this.pieces = [];
  this.food = [];

  this.settings = $.extend({
    snakePixels    : 14,
    snakeSize      : 3,
    bot            : true,
    timeout        : 3000,
    explosion      : true
  }, options);

  this.DIRECTIONS = {
    UP   : 0,
    DOWN : 2,
    LEFT  : 1,
    RIGHT : 3
  };

  this.bot = new Bot({directions : this.DIRECTIONS});
  if (this.settings.bot) this.bot.enable();
  this.direction = this.DIRECTIONS.RIGHT;
  this.directionQueue = [];
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
  this.directionQueue = [];
  this.direction = this.DIRECTIONS.RIGHT;
  this.pieces = [];
  this.food = [];
  this.particles = [];
  this.gravity = 1;
  this.fps = 15;

  if (this.animationTimeout) {
    clearTimeout(this.animationTimeout);
  }
};

Snake.prototype.restart = function () {
  if (typeof this.onRestart === 'function') {
    this.onRestart(this.score);
  }
  this.reset();
  this.start();
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
  setTimeout(this.restart.bind(this), this.settings.timeout);
};

Snake.prototype.queueDirection = function(direction) {
  if (this.bot.enabled) this.bot.disable();
  //check if direction allowed

  //Don't Allow The Same Moves To Stack Up
  if (this.started && this.directionQueue[this.directionQueue.length - 1] !== direction) {
    this.directionQueue.push(direction);
  }
};

Snake.prototype.onResize = function(height, width) {
  this.canvas.width = width;
  this.canvas.height = height;
};

Snake.prototype.create = function() {
  for (var x = 0; x < this.settings.snakeSize; x++) {
    this.pieces.push(new Piece({
      x : 0,
      y : 20,
      width : this.settings.snakePixels
    }));
  }
};

Snake.prototype.createFood = function() {
  this.food.push(new Food({
    x : Math.round(Math.random() * (this.canvas.width - this.settings.snakePixels) / this.settings.snakePixels),
    y : Math.round(Math.random() * (this.canvas.height - this.settings.snakePixels) / this.settings.snakePixels),
    width : this.settings.snakePixels,
    color : '#fff',
    border : '#000'
  }));
};

Snake.prototype.getDirection = function () {
  var direction;
  while (typeof direction === 'undefined' || (this.direction - direction + 4) % 4 === 2) {
    if (this.directionQueue.length > 0) {
      //Shift through the Queue
      direction = this.directionQueue.shift();
    }
    else {
      direction = this.direction;
    }
  }
  return direction;
};


Snake.prototype.isWallCollision = function(x,y) {
  var isTopCollision = y === -1,
    isRightCollision = x >= this.canvas.width / this.settings.snakePixels,
    isBottomCollision = y >= this.canvas.height / this.settings.snakePixels,
    isLeftCollision = x === -1;

  return isTopCollision || isRightCollision  || isBottomCollision || isLeftCollision;
};

Snake.prototype.isSelfCollision = function(x,y) {
  for (var i = 0; i < this.pieces.length; i++) {
    if (this.pieces[i].x == x && this.pieces[i].y == y) {
      return true;
    }
  }
  return false;
};

Snake.prototype.isFoodCollision = function(x,y) {
  var found = false;
  this.food.forEach(function(food) {
    if ((x == food.x && y == food.y)) {
      found = true;
    }
  });
  return found;
};

Snake.prototype.removeFood = function(x,y) {
  var self = this;
  this.food.forEach(function(food,ix) {
    if ((x == food.x && y == food.y)) {
      self.food.splice(ix);
    }
  });
};

Snake.prototype.createExplosion = function(x,y, colors) {
  for (var i = 0; i < this.particleCount; i++) {
    var particle = new Particle({
      x : x * this.settings.snakePixels,
      y : y * this.settings.snakePixels,
      color : colors ? colors[~~(Math.random()*colors.length)] : null
    });
    this.particles.push(particle);
  }
};

Snake.prototype.scorePoint = function() {
  this.score++;
  if (this.onScore && typeof this.onScore === 'function') {
    this.onScore(this.score);
  }
}


Snake.prototype.drawLoop = function() {
  var self = this;

  //Clear Canvas Context Before Redraw
  this.context.setTransform(1, 0, 0, 1, 0, 0);
  this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

  var headX = this.pieces[0].x;
  var headY = this.pieces[0].y;

  var direction = this.getDirection();
  //reset direction
  this.direction = direction;

  if (this.bot && this.bot.enabled) {
    this.direction = this.bot.getNextMove(this.pieces, this.food[0], {x : headX, y : headY}, this.direction, this.DIRECTIONS);
  }

  switch(this.direction) {
    case this.DIRECTIONS.LEFT:
      headX--;
      break;
    case this.DIRECTIONS.RIGHT:
      headX++;
      break;
    case this.DIRECTIONS.UP:
      headY--;
      break;
    case this.DIRECTIONS.DOWN:
      headY++;
      break;
  }

  if (this.isWallCollision(headX, headY) || this.isSelfCollision(headX, headY)) {
    this.lose();
  }

  if (this.started) {
    var headShift = null;
    var food = this.isFoodCollision(headX, headY);

    if (food) {
      this.scorePoint();
      //Increase Frames Per Second
      if (this.score % 2) {
        this.fps += 0.5;
      }

      if (this.settings.explosion) {
        this.createExplosion(headX, headY, [food.color,food.border]);
      }

      this.removeFood(headX, headY);
      this.createFood();

      //create new snake head
      headShift = new Piece({
        x : headX,
        y : headY,
        width : this.settings.snakePixels
      });

    } else {
      //Pop head tail to become new  head
      headShift = this.pieces.pop();
      headShift.updatePosition(headX, headY);
    }
    //move snakeTail to snakeHead
    this.pieces.unshift(headShift);
  }

  //Draw Snake
  this.pieces.forEach(function(piece) {
    piece.draw(self.context);
  });

  //Draw Food
  this.food.forEach(function(food) {
    food.draw(self.context);
  });
};

Snake.prototype.animationLoop = function() {
  if (this.started) {
    var self = this;
    if (this.animationTimeout) {
      clearTimeout(this.animationTimeout);
    }
    //Ensure FPS
    this.animationTimeout = setTimeout(function() {
      self.drawLoop.call(self);
      self.particleLoop.call(self);
      window.requestAnimationFrame(self.animationLoop.bind(self));
    }, 1000 / this.fps);
  }
};

Snake.prototype.particleLoop = function() {
  if (this.particles) {
    var self = this;
    var particles = [];
    this.particles.forEach(function(particle,ix) {
      //Apply Some Gravity
      particle.velocity.y += self.gravity;
      //Now Come Velocity
      particle.x += particle.velocity.x;
      particle.y += particle.velocity.y;
      particle.draw(self.context);

      if (particle.y < this.canvas.height * 1.1) {
        particles.push(particle);
      }
    });
    this.particles = particles;
  }
};


module.exports = Snake;
},{"./Bot":1,"./Food":2,"./Particle":4,"./Piece":5}],7:[function(require,module,exports){
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
},{"./GameContainer":3,"./Snake":6}],8:[function(require,module,exports){
/*global module*/

module.exports = {

  /**
   * Create a new cookie
   * @param name
   * @param value
   * @param days
   */
  create : function (name, value, days) {
    var d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toGMTString();
    //'secure', subdomain '.'?
    document.cookie = name + "=" + value + "; " + expires;
  },

  /**
   * Read an existing cookie
   * @param name
   * @returns {*}
   */
  read : function (name) {
    name = name + "=";
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
      var cookie = cookies[i].trim();
      if (cookie.indexOf(name) === 0) {
        return cookie.substring(name.length, cookie.length);
      }
    }
    return false;
  },

  /**
   * Remove an existing cookie
   * @param name
   */
  remove : function(name) {
    this.create(name,"",-1);
  }
};
},{}]},{},[7])