#!/usr/bin/env node

import cli from '@generates/cli'
import { createLogger } from '@generates/logger'

async function run () {
  const { _: [name], ...config } = cli({ name: 'generates' })
  const logger = createLogger(config.log)

  if (name) {
    try {
      //
      const { default: generator } = await import(`@generates/${name}`)

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
