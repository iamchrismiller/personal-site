module.exports = {
  options : {
    jshintrc : './.jshintrc'
  },

  gruntfile : ['Gruntfile.js'],
  src       : ['public/js/**/*.js', '!public/js/main.build.js', '!components/js/**/*.js']
};