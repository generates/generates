#!/usr/bin/env node

import cli from '@generates/cli'
import { createLogger } from '@generates/logger'

const logger = createLogger({ level: 'info', namespace: 'generates' })

async function run () {
  const { _: [name], ...config } = cli({ name: 'generates' })

  if (name) {
    const { generator } = await import(`@generates/${name}`)
    //

    //
    delete config._

    //
    await generator.generate()
  } else {
    // TODO: add helpful error message.
    throw new Error('Generator not found')
  }
}

run().catch(err => {
  logger.write('\n')
  logger.fatal(err)
  process.exit(1)
})
