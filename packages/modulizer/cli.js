#!/usr/bin/env node

import { promises as fs, mkdirSync } from 'fs'
import path from 'path'
import cli from '@generates/cli'
import pSettle from 'p-settle'
import { createLogger, chalk } from '@generates/logger'
import modulize from './index.js'

const logger = createLogger({ level: 'info', namespace: 'modulizer' })

async function run () {
  const input = cli({
    name: 'modulize',
    options: {
      name: {
        aliases: ['n']
      },
      output: {
        aliases: ['o']
      },
      cjs: {
        aliases: ['c']
      },
      esm: {
        aliases: ['e']
      },
      browser: {
        aliases: ['b']
      },
      inline: {
        aliases: ['i']
      },
      babel: {
        aliases: ['B']
      },
      plugins: {
        aliases: ['p']
      },
      minify: {
        aliases: ['m']
      }
    }
  })

  try {
    // Perform distribution file generation and get back a map of files to be
    // written to the filesystme.
    const files = Object.entries(await modulize(input))
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
