import path from 'path'
import readPkgUp from 'read-pkg-up'
import { rollup } from 'rollup'
import cjsPlugin from 'rollup-plugin-commonjs'
import nodeResolvePlugin from 'rollup-plugin-node-resolve'
import jsonPlugin from '@rollup/plugin-json'
import npmShortName from '@ianwalter/npm-short-name'
import babelPlugin from 'rollup-plugin-babel'
import requireFromString from 'require-from-string'
import builtinModules from 'builtin-modules/static'
import hashbang from '@ianwalter/rollup-plugin-hashbang'
import { terser } from 'rollup-plugin-terser'

export default async function dist (options) {
  // Read modules package.json.
  const { package: pkg, path: projectPath } = await readPkgUp()

  // TODO: comment
  const hasFormat = options.cjs || options.esm || options.browser
  const getFormat = (format, fallback) => hasFormat ? format : fallback

  // Deconstruct options and set defaults if necessary.
  let {
    name = options.name || npmShortName(pkg.name),
    input = options.input ||
            path.resolve(path.join(path.dirname(projectPath), 'index.js')),
    output = options.output || path.join(path.dirname(projectPath), 'dist'),
    cjs = getFormat(options.cjs, pkg.main),
    esm = getFormat(options.esm, pkg.module),
    browser = getFormat(options.browser, pkg.browser)
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
  const deps = Object.keys(pkg.dependencies || {})
  let inlineDeps = []
  let nodeResolve
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

  // Set the default babel config.
  const babelConfig = {
    runtimeHelpers: true,
    externalHelpers: true,
    babelrc: false,
    ...pkg.babel
  }

  // Determine which Rollup plugins should be used.
  const rollupPlugins = [
    // Allows the hashbang, in a CLI for example, to be preserved:
    hashbang(),
    // Allows dependencies to be bundled:
    nodeResolve,
    // Allows CommonJS dependencies to be imported:
    cjsPlugin(),
    // Allows JSON to be imported:
    jsonPlugin(),
    // Allows source to be transpiled with babel:
    ...options.babel ? [babelPlugin(babelConfig)] : [],
    // Allow users to pass in their own rollup plugins:
    ...plugins,
    //
    ...options.minify ? [terser(options.minify)] : []
  ]

  // Create the Rollup bundler instance(s).
  const bundler = await rollup({ input, external, plugins: rollupPlugins })

  // Generate the CommonJS bundle.
  let cjsBundle
  if (cjs) {
    cjsBundle = await bundler.generate({ format: 'cjs' })
  }

  // Generate the EcmaScript Module bundle.
  let esmBundle
  if (esm || browser) {
    esmBundle = await bundler.generate({ format: 'esm' })
  }

  const cjsCode = cjs ? cjsBundle.output[0].code : undefined
  const esmCode = (esm || browser) ? esmBundle.output[0].code : undefined

  // Determine the output file paths.
  const dir = path.extname(output) ? path.dirname(output) : output
  const cjsPath = typeof cjs === 'string' && path.extname(cjs)
    ? path.resolve(cjs)
    : path.join(dir, `${name}.js`)
  const esmPath = typeof esm === 'string' && path.extname(esm)
    ? path.resolve(esm)
    : path.join(dir, `${name}.m.js`)
  const browserPath = typeof browser === 'string' && path.extname(browser)
    ? path.resolve(browser)
    : path.join(dir, `${name}.browser.js`)

  // Return an object with the properties that use the file path as the key and
  // the source code as the value.
  return {
    ...(cjs ? { cjs: [cjsPath, cjsCode] } : {}),
    ...(esm ? { esm: [esmPath, esmCode] } : {}),
    ...(browser ? { browser: [browserPath, esmCode] } : {})
  }
}
