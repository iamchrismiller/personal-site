
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
  return '#' + ((!(Math.random()+.5|0) == true) ? 'FFFFFF' : '000000');
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