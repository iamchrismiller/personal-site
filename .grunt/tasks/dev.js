module.exports = function(grunt) {

  grunt.registerTask('dev', [
    'build',
    'connect',
    'watch'
  ]);
};