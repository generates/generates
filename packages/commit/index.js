const execa = require('execa')
const generates = require('@generates/core')

const opt = { stdio: 'inherit' }
const ctx = {
  data: {
    commit: {
      files: ['.'],
      user: {
        name: 'Generates Commit Bot',
        email: 'bot@generates.io'
      }
    }
  },
  prompts: {
    'commit.message': {
      type: 'editor',
      label: 'Enter a commit message:'
    }
  },
  tasks: {
    async configureUser () {
      const { user } = ctx.data.commit
      const cfg = ['config', '--global']

      // Configure the git user name if not already configured.
      const { stdout: name } = await execa('git', [...cfg, 'user.name'], opt)
      if (!name) await execa('git', [...cfg, 'user.name', user.name], opt)

      // Configure the git user email if not already configured.
      const { stdout: email } = await execa('git', [...cfg, 'user.email'], opt)
      if (!email) await execa('git', [...cfg, 'user.email', user.email], opt)
    },
    async stageFiles () {
      // Stage specified files.
      return execa('git', ['add', ...ctx.data.commit.files], opt)
    },
    async commit () {
      // Commit the staged files.
      return execa('git', ['commit', '-m', ctx.data.commit.message], opt)
    },
    async push () {
      // Conditionally push the commit to the remote.
      if (ctx.data.commit.push) return execa('git', ['push'], opt)
    }
  }
}

module.exports = generates.createGenerator(ctx)
