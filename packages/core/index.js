const { promises: fs } = require('fs')
const { merge } = require('@generates/merger')
const { stripIndent } = require('common-tags')
const prompt = require('@generates/prompt')
const dot = require('@ianwalter/dot')
const { createLogger } = require('@generates/logger')

async function toWriteFile ([key, file]) {
  return fs.writeFile(file.filename || key, file.content)
}

async function writeFiles (files) {
  return Promise.all(Object.entries(files).map(toWriteFile))
}

function createGenerator (ctx) {
  return {
    ctx,
    async generate (config) {
      // Merge the context provided by the generator with the config passed to
      // this method (e.g. through CLI flags).
      merge(ctx, config)

      //
      ctx.logger = createLogger(config.log)

      // Add some common utilities to ctx to be used to render templates.
      ctx.stripIndent = stripIndent
      ctx.join = (...items) => items.join('')
      ctx.exec = require('execa')

      // Execute all required prompts specified by the generator.
      for (const [key, p] of Object.entries(ctx.prompts)) {
        const isUndefined = dot.get(ctx.data, key) === undefined
        if (isUndefined && p.required !== false) {
          // Determine the prompt type and fallback to text.
          const type = p.type || 'text'

          // Prompt the user for a response and add it to ctx.data.
          dot.set(ctx.data, key, await prompt[type](p.label, p.settings))
        }
      }

      // Generate each files "content" using it's render method.
      const files = Object.values(ctx.files || {})
      for (const file of files) file.content = file.render(ctx)

      // Execute any tasks specified by the generator.
      const results = {}
      for (const [key, task] of Object.entries(ctx.tasks || {})) {
        results[key] = await task(ctx)
      }

      // If dryRun was passed as a setting or flag, just return the file map
      // instead of writing the files to disk below.
      if (ctx.dryRun) return { results, files }

      // Write files to disk.
      if (ctx.files) writeFiles(ctx.files)
    }
  }
}

module.exports = { createGenerator, writeFiles }
