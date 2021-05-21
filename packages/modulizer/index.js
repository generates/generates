import path from 'path'
import readPkgUp from 'read-pkg-up'
import { watch, rollup } from 'rollup'
import cjsPlugin from '@rollup/plugin-commonjs'
import nodeResolvePlugin from '@rollup/plugin-node-resolve'
import jsonPlugin from '@rollup/plugin-json'
import npmShortName from '@ianwalter/npm-short-name'
import { babel } from '@rollup/plugin-babel'
import requireFromString from 'require-from-string'
import builtinModules from 'builtin-modules/static.js'
import hashbang from '@ianwalter/rollup-plugin-hashbang'
import { terser } from 'rollup-plugin-terser'
import { createLogger } from '@generates/logger'
import generate from './lib/generate.js'

const logger = createLogger({ level: 'info', namespace: 'modulizer' })
const onwarn = warning => logger.debug(warning.message)
// FIXME: This fixes warning but breaks functionality:
// const cjsOut = { exports: 'auto' }

export default async function modulize ({ cwd, ...options }) {
  logger.debug('Input', { cwd, ...options })

  // Read modules package.json.
  const { package: pkg, path: projectPath } = await readPkgUp({ cwd })

  // FIXME: comment
  const hasFormat = options.cjs || options.esm || options.browser
  const getFormat = (format, fallback) => hasFormat ? format : fallback

  // Deconstruct options and set defaults if necessary.
  let {
    name = options.name || npmShortName(pkg.name),
    input = options.input || options.args[0] ||
            path.resolve(path.join(path.dirname(projectPath), 'index.js')),
    output = options.output || path.join(path.dirname(projectPath), 'dist'),
    cjs = getFormat(options.cjs, pkg.main),
    esm = getFormat(options.esm, pkg.module),
    browser = getFormat(options.browser, pkg.browser),
    skipWrite = false
  } = options
  const inline = options.inline || options.inline === ''

  cjs = cjs || cjs === ''
  esm = esm || esm === ''
  browser = browser || browser === ''

  // Import plugins file if specified.
  let plugins = []
  if (typeof options.plugins === 'string') {
    const input = path.resolve(options.plugins)
    const external = Object.keys(pkg.devDependencies || {})
    const { generate } = await rollup({ input, external })
    const { output: [{ code }] } = await generate({ format: 'cjs' })
    plugins = requireFromString(code)
  }

  // Determine which dependencies should be external (Node.js core modules
  // should always be external).
  let deps = Object.keys(pkg.dependencies || {})
  let inlineDeps = []
  let nodeResolve
  deps = deps.concat(Object.keys(pkg.peerDependencies))
  if (inline === true) {
    inlineDeps = deps
    nodeResolve = nodeResolvePlugin()
  } else if (inline) {
    inlineDeps = inline.split(',')
    nodeResolve = nodeResolvePlugin({ only: inlineDeps })
  }
  const externalModules = deps.filter(dep => inlineDeps.indexOf(dep) === -1)
  const externalDeps = [...builtinModules, ...externalModules]
  const external = id => (
    externalDeps.includes(id) ||
    externalModules.some(external => id.includes(external + path.sep))
  )
  logger.debug('External dependencies', externalDeps)

  // Set the default babel config.
  logger.debug('Babel config', pkg.babel)
  const babelConfig = {
    babelHelpers: 'bundled', // FIXME: use runtime instead?
    babelrc: false,
    ...pkg.babel
  }

  // Determine which Rollup plugins should be used.
  const rollupPlugins = [
    // Allows source to be transpiled with babel:
    ...options.babel ? [babel(babelConfig)] : [],
    // Allows the hashbang, in a CLI for example, to be preserved:
    hashbang(),
    // Allows dependencies to be bundled:
    nodeResolve,
    // Allows CommonJS dependencies to be imported:
    cjsPlugin(),
    // Allows JSON to be imported:
    jsonPlugin(),
    // Allow users to pass in their own rollup plugins:
    ...plugins,
    //
    ...options.minify ? [terser(options.minify)] : []
  ]

  // Determine the output directory.
  const dir = path.extname(output) ? path.dirname(output) : output

  const generateConfig = { name, cjs, esm, browser, dir, skipWrite }
  if (options.watch) {
    return new Promise(() => {
      // Create the Rollup watcher.
      const watcher = watch({
        input,
        output: { dir },
        external,
        plugins: rollupPlugins,
        watch: { skipWrite: true }
      })

      watcher.on('event', async event => {
        logger.debug('Watch event', event)
        if (event.code === 'BUNDLE_START') logger.info('Bundling...')
        if (event.error) logger.error(event.error)
        if (event.result) {
          // Generate the bundles and write them to files.
          await generate(event.result, generateConfig)

          // Call close to cleanup.
          event.result.close()
        }
      })
    })
  } else {
    // Create the Rollup bundler.
    const bundler = await rollup({
      input,
      external,
      plugins: rollupPlugins,
      preserveSymlinks: true,
      onwarn
    })

    // Generate the bundles and write them to files.
    return generate(bundler, generateConfig)
  }
}
