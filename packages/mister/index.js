import path from 'path'
import util from 'util'
import { createLogger } from '@generates/logger'
import glob from 'glob'
import readPkg from 'read-pkg'
import execa from 'execa'

const globa = util.promisify(glob)
const globOptions = { nosort: true, absolute: true }
const toGlobbed = p => globa(p, globOptions)
const logger = createLogger({ namespace: 'mister', level: 'info' })

export default async function run (config = {}) {
  const [command] = config.args

  if (!command) {
    // TODO:
  }

  // Get paths from config or from root package.json workspaces property.
  let relativePaths = config.paths || config.packageJson?.workspaces || []

  // If paths were specified as flags, use them instead.
  if (config.path) {
    relativePaths = Array.isArray(config.path) ? config.path : [config.path]
  }

  //
  const paths = (await Promise.all(relativePaths.map(toGlobbed))).flat()
  logger.debug('Paths:', paths)

  //
  async function run (cwd) {
    let pkg
    try {
      pkg = await readPkg({ cwd })
    } catch (err) {
      logger.debug(err)
    }

    if (pkg?.scripts && pkg.scripts[command]) {
      const relativePath = path.relative(process.cwd(), cwd)
      await logger.info(`Running in ${relativePath}: ${command}\n`)

      const args = ['run', '-s', ...config.args]
      await execa('npm', args, { cwd, stdio: 'inherit' })
      await logger.write('\n')
    } else {
      logger.debug(`Skipping ${cwd}`)
    }
  }

  if (config.serial) {
    for (const cwd of paths) await run(cwd)
  } else {
    await Promise.all(paths.map(run))
  }
}
