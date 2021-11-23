import path from 'path'
import util from 'util'
import { createLogger, chalk } from '@generates/logger'
import glob from 'glob'
import { readPackage } from 'read-pkg'
import { execa } from 'execa'

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
  async function runScript (cwd) {
    let pkg
    try {
      pkg = await readPackage({ cwd })
    } catch (err) {
      logger.debug(err)
    }

    if (pkg?.scripts && pkg.scripts[command]) {
      const relativePath = path.relative(process.cwd(), cwd)
      const loggedCommand = `${chalk.bold.white(command)}\n`
      await logger.info(`Running in ${relativePath}:`, loggedCommand)

      const args = ['run', '-s', ...config.args]
      await execa('npm', args, { cwd, stdio: 'inherit' })
      await logger.write('\n')
    } else {
      logger.debug(`Skipping ${cwd}`)
    }
  }

  if (config.serial) {
    for (const cwd of paths) await runScript(cwd)
  } else {
    await Promise.all(paths.map(runScript))
  }
}
