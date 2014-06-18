module.exports = {
  gruntfile : {
    files : 'Gruntfile.js',
    tasks : ['jshint:gruntfile']
  },

  src       : {
    files : ['public/**/*.js'],
    tasks : ['browserify']
  },

  sass : {
    files : ['public/assets/scss/**/*.scss'],
    tasks : ['sass']
  }
};