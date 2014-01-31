
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