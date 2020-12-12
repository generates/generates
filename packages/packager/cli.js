#!/usr/bin/env node

const fs = require('fs')
const { dirname } = require('path')
const { writeFile } = require('@ianwalter/fs')
const cli = require('@ianwalter/cli')
const pSettle = require('p-settle')
const { print, chalk } = require('@ianwalter/print')
const dist = require('.')

async function run () {
  const config = cli({
    name: 'dist',
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
    const files = Object.entries(await dist(config))
    if (files.length) {
      const writes = []
      files.forEach(([moduleType, [path, code]]) => {
        // Make the file's containing directory if it doesn't exist.
        fs.mkdirSync(dirname(path), { recursive: true })

        // Inform the user about what files are being written.
        const relative = path.replace(`${process.cwd()}/`, '')
        if (moduleType === 'cjs') {
          print.log('💿', 'Writing CommonJS dist file:', chalk.gray(relative))
        } else if (moduleType === 'esm') {
          print.log('📦', 'Writing ES Module dist file:', chalk.gray(relative))
        } else if (moduleType === 'browser') {
          print.log('🌎', 'Writing Browser dist file:', chalk.gray(relative))
        }

        // Add the file write operation to the list of writes to be completed
        writes.push(writeFile(path, code))
      })

      // Perform all of the writes in parallel, regardless of whether errors are
      // encountered in individual operations.
      const results = await pSettle(writes)

      // Filter the results for errors and log them.
      results.filter(r => r instanceof Error).forEach(err => print.error(err))
    } else {
      print.warn('No distribution files were specified')
    }
  } catch (err) {
    print.error(err)
    process.exit(1)
  }
}

run()
