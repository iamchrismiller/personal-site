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

Snake.prototype.bindEvents = function() {
  $(document).on('keydown', this.onKeydown.bind(this));
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

Snake.prototype.onKeydown = function (event) {
  var direction;

  //Gameplay Keys
  if (this.bot && [38,40,37,39].indexOf(event.keyCode) !== -1) {
    this.bot.disable();
  }

  switch (event.keyCode) {
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
      this.bot.enable();
      break;
    default :
      return;
  }

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

Snake.prototype.scorePoint = function() {
  this.score++;
  if (this.onScore && typeof this.onScore === 'function') {
    this.onScore(this.score);
  }
}

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