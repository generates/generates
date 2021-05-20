import path from 'path'
import { promises as fs, mkdirSync } from 'fs'
import { createLogger, chalk } from '@generates/logger'

const logger = createLogger({ level: 'info', namespace: 'modulizer.generate' })

export default async function generate (bundler, config) {
  const { name, cjs, esm, browser, dir, skipWrite } = config

  // Generate the CommonJS bundle.
  let cjsBundle
  if (cjs) cjsBundle = await bundler.generate({ format: 'cjs' })

  // Generate the EcmaScript Module bundle.
  let esmBundle
  if (esm || browser) esmBundle = await bundler.generate({ format: 'esm' })

  // Extract the source code from the bundle output.
  const cjsCode = cjs ? cjsBundle.output[0].code : undefined
  const esmCode = (esm || browser) ? esmBundle.output[0].code : undefined

  // Determine the path for the bundle files.
  const cjsPath = typeof cjs === 'string' && path.extname(cjs)
    ? path.resolve(cjs)
    : path.join(dir, `${name}.js`)
  const esmPath = typeof esm === 'string' && path.extname(esm)
    ? path.resolve(esm)
    : path.join(dir, `${name}.m.js`)
  const browserPath = typeof browser === 'string' && path.extname(browser)
    ? path.resolve(browser)
    : path.join(dir, `${name}.browser.js`)

  // Create an array of files to write.
  const files = [
    ...cjs ? [{ type: 'cjs', path: cjsPath, source: cjsCode }] : [],
    ...esm ? [{ type: 'esm', path: esmPath, source: esmCode }] : [],
    ...browser ? [{ type: 'browser', path: browserPath, source: esmCode }] : []
  ]

  if (skipWrite) return files

  if (files.length) {
    // Write the bundle files to the file system.
    await Promise.all(files.map(async file => {
      try {
        // Make the file's containing directory if it doesn't exist.
        mkdirSync(path.dirname(file.path), { recursive: true })

        // Inform the user about what files are being written.
        const relative = file.path.replace(`${process.cwd()}/`, '')
        if (file.type === 'cjs') {
          logger.log('💿', 'Writing CommonJS dist file:', chalk.dim(relative))
        } else if (file.type === 'esm') {
          logger.log('📦', 'Writing ES Module dist file:', chalk.dim(relative))
        } else if (file.type === 'browser') {
          logger.log('🌎', 'Writing Browser dist file:', chalk.dim(relative))
        }

        // Write the bundle file.
        await fs.writeFile(file.path, file.source)
      } catch (err) {
        logger.error(err)
      }
    }))
  } else {
    logger.warn('No distribution files were specified')
  }
}
