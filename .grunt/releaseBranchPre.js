module.exports = {
  release : {
    options: {
      releaseBranch: 'gh-pages',
      remoteRepository: 'origin',
      cwd: '.',
      distDir: 'public',
      commitMessage: 'Automated gh-page build',
      commit: true,
      push: true,
      blacklist: [
        '.git',
        '.gitignore',
        'node_modules',
        'CNAME'
      ]
    }
  }
};