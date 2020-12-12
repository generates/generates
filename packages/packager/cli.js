#!/usr/bin/env node

import { promises as fs, mkdirSync } from 'fs'
import path from 'path'
import cli from '@generates/cli'
import pSettle from 'p-settle'
import { createLogger, chalk } from '@generates/logger'
import pack from './index.js'

const logger = createLogger({ level: 'info', namespace: 'packager' })

async function run () {
  const config = cli({
    name: 'pack',
    opts: {
      alias: {
        name: 'n',
        output: 'o',
        cjs: 'c',
        esm: 'e',
        browser: 'b',
        inline: 'i',
        babel: 'B',
        plugins: 'p',
        minify: 'm'
      }
    }
  })

  // TODO: comment
  config.input = config._.length ? config._[0] : config.input
  delete config._

  try {
    // Perform distribution file generation and get back a map of files to be
    // written to the filesystme.
    const files = Object.entries(await pack(config))
    if (files.length) {
      const writes = []
      files.forEach(([moduleType, [filename, code]]) => {
        // Make the file's containing directory if it doesn't exist.
        mkdirSync(path.dirname(filename), { recursive: true })

        // Inform the user about what files are being written.
        const relative = filename.replace(`${process.cwd()}/`, '')
        if (moduleType === 'cjs') {
          logger.log('💿', 'Writing CommonJS dist file:', chalk.gray(relative))
        } else if (moduleType === 'esm') {
          logger.log('📦', 'Writing ES Module dist file:', chalk.gray(relative))
        } else if (moduleType === 'browser') {
          logger.log('🌎', 'Writing Browser dist file:', chalk.gray(relative))
        }

        // Add the file write operation to the list of writes to be completed
        writes.push(fs.writeFile(filename, code))
      })

      // Perform all of the writes in parallel, regardless of whether errors are
      // encountered in individual operations.
      const results = await pSettle(writes)

      // Filter the results for errors and log them.
      results.filter(r => r instanceof Error).forEach(err => logger.error(err))
    } else {
      logger.warn('No distribution files were specified')
    }
  } catch (err) {
    logger.error(err)
    process.exit(1)
  }
}

run()
