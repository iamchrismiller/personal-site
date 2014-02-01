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