import generates from '@generates/core'

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
      const log = ctx.logger.ns('generates.commit')

      // Configure the git user name if not already configured.
      let result = await ctx.exec('git', [...cfg, 'user.name'], opt)
      if (!result.stdout) {
        log.debug('git config user.name result', result)
        await ctx.exec('git', [...cfg, 'user.name', user.name], opt)
      }

      // Configure the git user email if not already configured.
      result = await ctx.exec('git', [...cfg, 'user.email'], opt)
      if (!result.stdout) {
        log.debug('git config user.email result', result)
        await ctx.exec('git', [...cfg, 'user.email', user.email], opt)
      }
    },
    async stageFiles () {
      // Stage specified files.
      return ctx.exec('git', ['add', ...ctx.data.commit.files], opt)
    },
    async commit () {
      // Commit the staged files.
      const { message } = ctx.data.commit
      if (message) return ctx.exec('git', ['commit', '-m', message], opt)
    },
    async push () {
      // Conditionally push the commit to the remote.
      if (ctx.data.commit.push) return ctx.exec('git', ['push'], opt)
    }
  }
}

module.exports = generates.createGenerator(ctx)
