/*global module, process, require*/

module.exports = function (grunt) {
  "use strict";

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-bower-task');
  grunt.loadNpmTasks('grunt-jquery-builder');
  grunt.loadNpmTasks('grunt-release-branch');

  require('matchdep')
    .filter('grunt-*')
    .filter(function(n) { return n !== 'grunt-cli'; })
    .forEach(grunt.loadNpmTasks);

  var gruntConfig = {};

  var fs = require('fs')
    .readdirSync('.grunt')
    .filter(function(n) { return (/.js$/).test(n); })
    .map(function(n) { return n.replace(/\.js$/,''); })
    .forEach(function(task){
      gruntConfig[task] = require('./.grunt/' + task + '.js');
    });

  grunt.initConfig(gruntConfig);

  //Install jQuery Custom Build + Bower Components
  grunt.registerTask('install-dev', [
    'jquery:build',
    'bower:install'
  ]);

  grunt.registerTask('dev', [
//    'jshint',
    'sass',
    'browserify',
    'uglify',
    'connect',
    'watch'
  ]);


  grunt.registerTask('release', ['releaseBranchPre', 'releaseBranch:release']);

};

