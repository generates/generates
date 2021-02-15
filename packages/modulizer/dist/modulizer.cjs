'use strict';

var path = require('path');
var readPkgUp = require('read-pkg-up');
var rollup = require('rollup');
var cjsPlugin = require('@rollup/plugin-commonjs');
var nodeResolvePlugin = require('@rollup/plugin-node-resolve');
var jsonPlugin = require('@rollup/plugin-json');
var npmShortName = require('@ianwalter/npm-short-name');
var pluginBabel = require('@rollup/plugin-babel');
var requireFromString = require('require-from-string');
var builtinModules = require('builtin-modules/static.js');
var hashbang = require('@ianwalter/rollup-plugin-hashbang');
var rollupPluginTerser = require('rollup-plugin-terser');
var logger$1 = require('@generates/logger');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var path__default = /*#__PURE__*/_interopDefaultLegacy(path);
var readPkgUp__default = /*#__PURE__*/_interopDefaultLegacy(readPkgUp);
var cjsPlugin__default = /*#__PURE__*/_interopDefaultLegacy(cjsPlugin);
var nodeResolvePlugin__default = /*#__PURE__*/_interopDefaultLegacy(nodeResolvePlugin);
var jsonPlugin__default = /*#__PURE__*/_interopDefaultLegacy(jsonPlugin);
var npmShortName__default = /*#__PURE__*/_interopDefaultLegacy(npmShortName);
var requireFromString__default = /*#__PURE__*/_interopDefaultLegacy(requireFromString);
var builtinModules__default = /*#__PURE__*/_interopDefaultLegacy(builtinModules);
var hashbang__default = /*#__PURE__*/_interopDefaultLegacy(hashbang);

const logger = logger$1.createLogger({ level: 'info', namespace: 'modulizer' });
const onwarn = warning => logger.debug(warning.message);
// const cjsOut = { exports: 'auto' }

async function modulize ({ cwd, ...options }) {
  // Read modules package.json.
  const { package: pkg, path: projectPath } = await readPkgUp__default['default']({ cwd });

  // FIXME: comment
  const hasFormat = options.cjs || options.esm || options.browser;
  const getFormat = (format, fallback) => hasFormat ? format : fallback;

  // Deconstruct options and set defaults if necessary.
  let {
    name = options.name || npmShortName__default['default'](pkg.name),
    input = options.input ||
            path__default['default'].resolve(path__default['default'].join(path__default['default'].dirname(projectPath), 'index.js')),
    output = options.output || path__default['default'].join(path__default['default'].dirname(projectPath), 'dist'),
    cjs = getFormat(options.cjs, pkg.main),
    esm = getFormat(options.esm, pkg.module),
    browser = getFormat(options.browser, pkg.browser)
  } = options;
  const inline = options.inline || options.inline === '';

  cjs = cjs || cjs === '';
  esm = esm || esm === '';
  browser = browser || browser === '';

  // Import plugins file if specified.
  let plugins = [];
  if (typeof options.plugins === 'string') {
    const input = path__default['default'].resolve(options.plugins);
    const external = Object.keys(pkg.devDependencies || {});
    const { generate } = await rollup.rollup({ input, external });
    const { output: [{ code }] } = await generate({ format: 'cjs' });
    plugins = requireFromString__default['default'](code);
  }

  // Determine which dependencies should be external (Node.js core modules
  // should always be external).
  const deps = Object.keys(pkg.dependencies || {});
  let inlineDeps = [];
  let nodeResolve;
  if (inline === true) {
    inlineDeps = deps;
    nodeResolve = nodeResolvePlugin__default['default']();
  } else if (inline) {
    inlineDeps = inline.split(',');
    nodeResolve = nodeResolvePlugin__default['default']({ only: inlineDeps });
  }
  const externalModules = deps.filter(dep => inlineDeps.indexOf(dep) === -1);
  const externalDeps = [...builtinModules__default['default'], ...externalModules];
  const external = id => (
    externalDeps.includes(id) ||
    externalModules.some(external => id.includes(external + path__default['default'].sep))
  );
  logger.debug('External dependencies', externalDeps);

  // Set the default babel config.
  const babelConfig = {
    babelHelpers: 'bundled', // TODO: use runtime instead?
    babelrc: false,
    ...pkg.babel
  };

  // Determine which Rollup plugins should be used.
  const rollupPlugins = [
    // Allows the hashbang, in a CLI for example, to be preserved:
    hashbang__default['default'](),
    // Allows dependencies to be bundled:
    nodeResolve,
    // Allows CommonJS dependencies to be imported:
    cjsPlugin__default['default'](),
    // Allows JSON to be imported:
    jsonPlugin__default['default'](),
    // Allows source to be transpiled with babel:
    ...options.babel ? [pluginBabel.babel(babelConfig)] : [],
    // Allow users to pass in their own rollup plugins:
    ...plugins,
    //
    ...options.minify ? [rollupPluginTerser.terser(options.minify)] : []
  ];

  // Create the Rollup bundler instance(s).
  const bundler = await rollup.rollup({
    input,
    external,
    plugins: rollupPlugins,
    preserveSymlinks: true,
    onwarn
  });

  // Generate the CommonJS bundle.
  let cjsBundle;
  if (cjs) cjsBundle = await bundler.generate({ format: 'cjs' });

  // Generate the EcmaScript Module bundle.
  let esmBundle;
  if (esm || browser) esmBundle = await bundler.generate({ format: 'esm' });

  const cjsCode = cjs ? cjsBundle.output[0].code : undefined;
  const esmCode = (esm || browser) ? esmBundle.output[0].code : undefined;

  // Determine the output file paths.
  const dir = path__default['default'].extname(output) ? path__default['default'].dirname(output) : output;
  const cjsPath = typeof cjs === 'string' && path__default['default'].extname(cjs)
    ? path__default['default'].resolve(cjs)
    : path__default['default'].join(dir, `${name}.js`);
  const esmPath = typeof esm === 'string' && path__default['default'].extname(esm)
    ? path__default['default'].resolve(esm)
    : path__default['default'].join(dir, `${name}.m.js`);
  const browserPath = typeof browser === 'string' && path__default['default'].extname(browser)
    ? path__default['default'].resolve(browser)
    : path__default['default'].join(dir, `${name}.browser.js`);

  // Return an object with the properties that use the file path as the key and
  // the source code as the value.
  return {
    ...cjs ? { cjs: [cjsPath, cjsCode] } : {},
    ...esm ? { esm: [esmPath, esmCode] } : {},
    ...browser ? { browser: [browserPath, esmCode] } : {}
  }
}

module.exports = modulize;
