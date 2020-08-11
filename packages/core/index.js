const { promises: fs } = require('fs')
const merge = require('@ianwalter/merge')
const { stripIndent } = require('common-tags')
const prompt = require('@generates/prompt')
const dot = require('@ianwalter/dot')

async function toWriteFile ([key, file]) {
  return fs.writeFile(file.filename || key, file.content)
}

function createGenerator (ctx) {
  return {
    async generate (config) {
      // Merge the context provided by the generator with the config passed to
      // this method (e.g. through CLI flags).
      merge(ctx, config)

      // Ask all required questions specified by the generator.
      for (const [key, q] of Object.entries(ctx.questions)) {
        const isUndefined = dot.get(ctx.data, key) === undefined
        if (isUndefined && q.required !== false) {
          // Determine the prompt type and fallback to text.
          const type = q.type || 'text'

          // Prompt the user for an answer and add it to ctx.data.
          dot.set(ctx.data, key, await prompt[type](q.question, q.settings))
        }
      }

      // Add some common utilities to ctx to be used to render templates.
      ctx.stripIndent = stripIndent
      ctx.join = (...items) => items.join('')

      // Create a map of files and their content.
      const files = Object.entries(ctx.files).reduce(
        (acc, [key, { render, ...file }]) => {
          acc[key] = { ...file, content: render(ctx) }
          return acc
        },
        {}
      )

      // If dryRun was passed as a setting or flag, just return the file map
      // instead of writing the files to disk below.
      if (ctx.dryRun) return files

      // Write the files to disk.
      await Promise.all(Object.entries(files).map(toWriteFile))
    }
  }
}

module.exports = { createGenerator }
