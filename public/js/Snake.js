/*global requestAnimationFrame, module, require, $ */

var Particle = require('./Particle');
var cookie = require('./util/cookie');

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
  this.snakePieces = [];
  this.snakeFood = [];
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
  var self = this;
  this.pause();

  setTimeout(function() {
    self.restart();
  }, 3000);
};

Snake.prototype.onKeydown = function (event) {
  var direction;

  //Gameplay Keys
  if (this.bot && [38,40,37,39].indexOf(event.keyCode) !== -1) {
    this.disableBot();
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
      this.enableBot();
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
    this.snakePieces.push({ x : 0, y : 20 });
  }
};

Snake.prototype.createFood = function() {
  this.snakeFood.push({
    x : Math.round(Math.random() * (this.canvas.width - this.settings.snakePixels) / this.settings.snakePixels),
    y : Math.round(Math.random() * (this.canvas.height - this.settings.snakePixels) / this.settings.snakePixels)
  });
};

Snake.prototype._getDirection = function () {
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

Snake.prototype.drawSnake = function() {
  for (var i = 0; i < this.snakePieces.length; i++) {
    var x = this.snakePieces[i];
    this.drawPart(x.x, x.y);
  }
};

Snake.prototype.drawFood = function(x,y) {
  var self = this;
  var width = this.settings.snakePixels;
  this.context.fillStyle = "#ffffff";
  this.context.strokeStyle = "#000000";

  this.snakeFood.forEach(function(food) {
    self.context.fillRect(food.x * width, food.y * width, width, width);
    self.context.strokeRect(food.x * width, food.y * width, width, width);
  });
};


Snake.prototype.drawPart = function(x,y) {
  var width = this.settings.snakePixels;
  this.context.fillStyle = "#ffffff";
  this.context.strokeStyle = "#000000";
  this.context.fillRect(x * width, y * width, width, width);
  this.context.strokeRect(x * width, y * width, width, width);
};

Snake.prototype.createExpolosion = function(x,y) {
  for (var i = 0; i < this.particleCount; i++) {
    var particle = new Particle({x : x * this.settings.snakePixels, y : y * this.settings.snakePixels});
    this.particles.push(particle);
  }
};


Snake.prototype.drawLoop = function() {
  //Clear Canvas Context Before Redraw
  this.context.setTransform(1, 0, 0, 1, 0, 0);
  this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

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

  if (this.isWallCollision(headX, headY)) {
    this.lose();
  }

  if (this.isSelfCollision(headX, headY)) {
    this.lose();
  }

  var snakeTail = {};

  if (this.started) {
    if (this.isFoodCollision(headX, headY)) {
      this.scorePoint();
      //Increase Frames Per Secod
      if (this.score % 2) {
        this.fps += 0.5;
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
    this.particles.forEach(function(particle,ix) {
      //Apply Some Gravity
      particle.velocity.y += self.gravity;
      //Now Come Velocity
      particle.x += particle.velocity.x;
      particle.y += particle.velocity.y;
      particle.draw(self.context);
      if (particle.y > this.canvas.height * 1.1) {
        self.particles.splice(ix);
      }
    });
  }
};


//--------------------
// Automated Bot Logic
//--------------------

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