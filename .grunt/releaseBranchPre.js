module.exports = {
  release : {
    options: {
      releaseBranch: 'gh-pages',
      remoteRepository: 'origin',
      cwd: '.',
      distDir: 'public',
      commitMessage: 'Build GH-Pages.',
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