# @ianwalter/dist
> Simplify the generation of distribution files for your JavaScript library

[![npm page][npmImage]][npmUrl]

## About

`dist` is basically a wrapper around [Rollup][rollupUrl], inspired by
[microbundle][microbundleUrl], but is specific to the use-cases described below.

## Features

* Write your library as an EcmaScript Module but still allow it to be require'd
  in Node.js
* Inline your library's dependencies to create a single distribution file that
  should significantly improve startup time (a quick test of bundling a single
  dependency cut the dependency's load time in half)
* Use the babel option to transpile your code based on your library's
  [Babel][babelUrl] configuration

## Options

* `--name, -n`    Name to use for files and global variable (defaults to name in
                  package.json)
* `--input, -i`   Filename of source/entry file (defaults to {cwd}/index.js)
* `--output, -o`  Output filename or directory path (defaults to ./dist)
* `--cjs, -c`     Path for / whether to create a CommonJS dist file (defaults to
                  false or main in package.json)
* `--esm, -e`     Path for / whether to create a ESM dist file (defaults to
                  false or module in package.json)
* `--browser, -b` Path for / whether to create a browser-specific (ESM)
                  dist file (defaults to false or browser in package.json)
* `--inline, -l`  Inline/bundle imported modules (defaults to false)
* `--babel, -B`       Transpile output with Babel (defaults to false)
* `--plugins, -p` Specify a path for a Rollup plugins file to include
* `--minify, -m`  Use Terser to minify output (defaults to false)

## License

Apache 2.0 with Commons Clause - See [LICENSE][licenseUrl]

&nbsp;

Created by [Ian Walter](https://iankwalter.com)

[npmImage]: https://img.shields.io/npm/v/@ianwalter/dist.svg
[npmUrl]: https://www.npmjs.com/package/@ianwalter/dist
[rollupUrl]: https://rollupjs.org/
[microbundleUrl]: https://github.com/developit/microbundle
[puppeteerUrl]: https://pptr.dev/
[babelUrl]: https://babeljs.io/
[licenseUrl]: https://github.com/ianwalter/dist/blob/master/LICENSE

