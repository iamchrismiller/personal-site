
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