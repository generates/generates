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
var logger$2 = require('@generates/logger');
var fs = require('fs');

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

const logger = logger$2.createLogger({ level: 'info', namespace: 'modulizer.generate' });

async function generate (bundler, config) {
  const { name, cjs, esm, browser, dir, skipWrite } = config;

  // Generate the CommonJS bundle.
  let cjsBundle;
  if (cjs) cjsBundle = await bundler.generate({ format: 'cjs' });

  // Generate the EcmaScript Module bundle.
  let esmBundle;
  if (esm || browser) esmBundle = await bundler.generate({ format: 'esm' });

  // Extract the source code from the bundle output.
  const cjsCode = cjs ? cjsBundle.output[0].code : undefined;
  const esmCode = (esm || browser) ? esmBundle.output[0].code : undefined;

  // Determine the path for the bundle files.
  const cjsPath = typeof cjs === 'string' && path__default['default'].extname(cjs)
    ? path__default['default'].resolve(cjs)
    : path__default['default'].join(dir, `${name}.js`);
  const esmPath = typeof esm === 'string' && path__default['default'].extname(esm)
    ? path__default['default'].resolve(esm)
    : path__default['default'].join(dir, `${name}.m.js`);
  const browserPath = typeof browser === 'string' && path__default['default'].extname(browser)
    ? path__default['default'].resolve(browser)
    : path__default['default'].join(dir, `${name}.browser.js`);

  // Create an array of files to write.
  const files = [
    ...cjs ? [{ type: 'cjs', path: cjsPath, source: cjsCode }] : [],
    ...esm ? [{ type: 'esm', path: esmPath, source: esmCode }] : [],
    ...browser ? [{ type: 'browser', path: browserPath, source: esmCode }] : []
  ];

  if (skipWrite) return files

  if (files.length) {
    // Write the bundle files to the file system.
    await Promise.all(files.map(async file => {
      try {
        // Make the file's containing directory if it doesn't exist.
        fs.mkdirSync(path__default['default'].dirname(file.path), { recursive: true });

        // Inform the user about what files are being written.
        const relative = file.path.replace(`${process.cwd()}/`, '');
        if (file.type === 'cjs') {
          logger.log('💿', 'Writing CommonJS dist file:', logger$2.chalk.dim(relative));
        } else if (file.type === 'esm') {
          logger.log('📦', 'Writing ES Module dist file:', logger$2.chalk.dim(relative));
        } else if (file.type === 'browser') {
          logger.log('🌎', 'Writing Browser dist file:', logger$2.chalk.dim(relative));
        }

        // Write the bundle file.
        await fs.promises.writeFile(file.path, file.source);
      } catch (err) {
        logger.error(err);
      }
    }));
  } else {
    logger.warn('No distribution files were specified');
  }
}

const logger$1 = logger$2.createLogger({ level: 'info', namespace: 'modulizer' });
const onwarn = warning => logger$1.debug(warning.message);
// FIXME: This fixes warning but breaks functionality:
// const cjsOut = { exports: 'auto' }

async function modulize ({ cwd, ...options }) {
  logger$1.debug('Input', { cwd, ...options });

  // Read modules package.json.
  const { package: pkg, path: projectPath } = await readPkgUp__default['default']({ cwd });

  // FIXME: comment
  const hasFormat = options.cjs || options.esm || options.browser;
  const getFormat = (format, fallback) => hasFormat ? format : fallback;

  // Deconstruct options and set defaults if necessary.
  let {
    name = options.name || npmShortName__default['default'](pkg.name),
    input = options.input || options.args[0] ||
            path__default['default'].resolve(path__default['default'].join(path__default['default'].dirname(projectPath), 'index.js')),
    output = options.output || path__default['default'].join(path__default['default'].dirname(projectPath), 'dist'),
    cjs = getFormat(options.cjs, pkg.main),
    esm = getFormat(options.esm, pkg.module),
    browser = getFormat(options.browser, pkg.browser),
    skipWrite = false
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
  logger$1.debug('External dependencies', externalDeps);

  // Set the default babel config.
  logger$1.debug('Babel config', pkg.babel);
  const babelConfig = {
    babelHelpers: 'bundled', // FIXME: use runtime instead?
    babelrc: false,
    ...pkg.babel
  };

  // Determine which Rollup plugins should be used.
  const rollupPlugins = [
    // Allows source to be transpiled with babel:
    ...options.babel ? [pluginBabel.babel(babelConfig)] : [],
    // Allows the hashbang, in a CLI for example, to be preserved:
    hashbang__default['default'](),
    // Allows dependencies to be bundled:
    nodeResolve,
    // Allows CommonJS dependencies to be imported:
    cjsPlugin__default['default'](),
    // Allows JSON to be imported:
    jsonPlugin__default['default'](),
    // Allow users to pass in their own rollup plugins:
    ...plugins,
    //
    ...options.minify ? [rollupPluginTerser.terser(options.minify)] : []
  ];

  // Determine the output directory.
  const dir = path__default['default'].extname(output) ? path__default['default'].dirname(output) : output;

  const generateConfig = { name, cjs, esm, browser, dir, skipWrite };
  if (options.watch) {
    return new Promise(() => {
      // Create the Rollup watcher.
      const watcher = rollup.watch({ input, output: { dir }, skipWrite: true });

      watcher.on('event', async event => {
        logger$1.debug('Watch event', event);
        if (event.error) logger$1.error(event.error);
        if (event.result) {
          // Generate the bundles and write them to files.
          await generate(event.result, generateConfig);

          // Call close to cleanup.
          event.result.close();
        }
      });
    })
  } else {
    // Create the Rollup bundler.
    const bundler = await rollup.rollup({
      input,
      external,
      plugins: rollupPlugins,
      preserveSymlinks: true,
      onwarn
    });

    // Generate the bundles and write them to files.
    return generate(bundler, generateConfig)
  }
}

module.exports = modulize;
