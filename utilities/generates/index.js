#!/usr/bin/env node

const cli = require('@generates/cli')
const { createLogger } = require('@generates/logger')

async function run () {
  const { _: [name], ...config } = cli({ name: 'generates' })
  const logger = createLogger(config.log)

  if (name) {
    try {
      //
      const generator = require(`@generates/${name}`)

      //
      delete config._

      //
      await generator.generate()
    } catch (err) {
      logger.error(err) // TODO: add helpful error message.
    }
  } else {
    // TODO: add helpful error message.
  }
}

run()
