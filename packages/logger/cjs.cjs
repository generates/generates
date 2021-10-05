'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var util = require('util');
var dotter = require('@generates/dotter');
var chalk = require('chalk');
var hasAnsi = require('has-ansi');
var hasEmoji = require('has-emoji');
var marked = require('marked');
var TerminalRenderer = require('marked-terminal');
var stripAnsi = require('strip-ansi');
var merger = require('@generates/merger');
var emphasize = require('emphasize');
var isRegexp = require('is-regexp');
var isObject = require('is-obj');
var getOwnEnumPropSymbols = require('get-own-enumerable-property-symbols');
var commonTags = require('common-tags');
var numberLines = require('@generates/number-lines');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var util__default = /*#__PURE__*/_interopDefaultLegacy(util);
var chalk__default = /*#__PURE__*/_interopDefaultLegacy(chalk);
var hasAnsi__default = /*#__PURE__*/_interopDefaultLegacy(hasAnsi);
var hasEmoji__default = /*#__PURE__*/_interopDefaultLegacy(hasEmoji);
var marked__default = /*#__PURE__*/_interopDefaultLegacy(marked);
var TerminalRenderer__default = /*#__PURE__*/_interopDefaultLegacy(TerminalRenderer);
var stripAnsi__default = /*#__PURE__*/_interopDefaultLegacy(stripAnsi);
var isRegexp__default = /*#__PURE__*/_interopDefaultLegacy(isRegexp);
var isObject__default = /*#__PURE__*/_interopDefaultLegacy(isObject);
var getOwnEnumPropSymbols__default = /*#__PURE__*/_interopDefaultLegacy(getOwnEnumPropSymbols);

// Modified from: https://github.com/yeoman/stringify-object

function stringify (input, options, pad) {
  const seen = [];

  return (function stringify (input, options = {}, pad = '') {
    const indent = options.indent || '  ';

    let tokens;
    if (options.inlineCharacterLimit === undefined) {
      tokens = {
        newline: '\n',
        newlineOrSpace: '\n',
        pad,
        indent: pad + indent
      };
    } else {
      tokens = {
        newline: '@@__STRINGIFY_OBJECT_NEW_LINE__@@',
        newlineOrSpace: '@@__STRINGIFY_OBJECT_NEW_LINE_OR_SPACE__@@',
        pad: '@@__STRINGIFY_OBJECT_PAD__@@',
        indent: '@@__STRINGIFY_OBJECT_INDENT__@@'
      };
    }

    if (seen.includes(input)) return '"[Circular]"'

    if (
      input === null ||
      input === undefined ||
      typeof input === 'number' ||
      typeof input === 'boolean' ||
      typeof input === 'function' ||
      typeof input === 'symbol' ||
      isRegexp__default['default'](input)
    ) {
      return String(input)
    }

    if (input instanceof Date) return `new Date('${input.toISOString()}')`

    if (input instanceof Error) {
      const obj = { ...input };
      const hasExtraProps = Object.keys(obj);
      return commonTags.stripIndent`
        Object.assign(
          new ${input.constructor.name}('${input.message}'),
          {
            stack: \`${input.stack}\`
          }${hasExtraProps && `,
          ${stringify(obj, options, pad + indent + '    ')}`}
        )
      `
    }

    if (Array.isArray(input)) {
      if (input.length === 0) return '[]'

      seen.push(input);

      const returnValue = '[' + tokens.newline + input.map((element, i) => {
        const eol = input.length - 1 === i
          ? tokens.newline
          : ',' + tokens.newline;

        let value = stringify(element, options, pad + indent);
        if (options.transform) value = options.transform(input, i, value);

        return tokens.indent + value + eol
      }).join('') + tokens.pad + ']';

      seen.pop();

      return returnValue
    }

    if (isObject__default['default'](input)) {
      let objectKeys = [
        ...Object.keys(input),
        ...getOwnEnumPropSymbols__default['default'].default(input)
      ];

      if (options.filter) {
        objectKeys = objectKeys
          .filter(element => options.filter(input, element));
      }

      if (objectKeys.length === 0) return '{}'

      seen.push(input);

      const returnValue = '{' + tokens.newline + objectKeys.map((el, i) => {
        const eol = objectKeys.length - 1 === i
          ? tokens.newline
          : ',' + tokens.newlineOrSpace;
        const isSymbol = typeof element === 'symbol';
        const isClassic = !isSymbol && /^[a-z$_][$\w]*$/i.test(el);
        const key = isSymbol || isClassic ? el : stringify(el, options);

        let value = stringify(input[el], options, pad + indent);
        if (options.transform) value = options.transform(input, el, value);

        return tokens.indent + String(key) + ': ' + value + eol
      }).join('') + tokens.pad + '}';

      seen.pop();

      return returnValue
    }

    input = String(input).replace(/[\r\n]/g, x => x === '\n' ? '\\n' : '\\r');

    if (options.singleQuotes === false) {
      input = input.replace(/"/g, '\\"');
      return `"${input}"`
    }

    input = input.replace(/\\?'/g, '\\\'');
    return `'${input}'`
  })(input, options, pad)
}

const defaultOptions = {
  highlight: true,
  lineNumbers: true,
  indent: '  '
};
const formatLineNumber = lineNumber => chalk__default['default'].dim(lineNumber);

function prettify (value, options = defaultOptions) {
  if (typeof value === 'object') {
    value = stringify(value, { indent: options.indent });
  }
  if (options.highlight) {
    const res = emphasize.emphasize.highlightAuto(value);
    value = res.value;

    if (options.lineNumbers) {
      value = numberLines.numberLines(value.split('\n'), formatLineNumber).join('\n');
    }
  }
  return value
}

// Set up marked with the TerminalRenderer.
marked__default['default'].setOptions({ renderer: new TerminalRenderer__default['default']({ tab: 2 }) });

const atRe = /^\s+at\s(.*)/;
const refRe = /^\s+at\s(.*)\s(\(.*\))$/;
const toPaddedString = s => `    ${s}`;
const toPaddedLine = line => line ? toPaddedString(line) : line;
const toPaddedItems = (a, i) => a.concat(['\n', ...i ? [toPaddedLine(i)] : []]);
const toMarkdownItems = i => md(i).split('\n').map(toPaddedString).join('\n');
const at = chalk__default['default'].gray('at');
const byNotWhitespace = str => str && str.trim();
const isANewLine = msg => typeof msg === 'string' && msg === '\n';
const md = str => marked__default['default'](str).trimEnd();

function extractLogPrefix ({ items: [first, ...rest] }) {
  let prefix = ' ';
  if (typeof first === 'string' && hasEmoji__default['default'](first)) {
    const [actual, ...actualRest] = rest;
    prefix = first;
    first = actual;
    rest = actualRest;
  }
  return { prefix, items: [first, ...rest] }
}

function formatMarkdown (log) {
  log.items = log.items.map(toMarkdownItems);
}

function toStackLines (line) {
  if (line.match(refRe)) {
    return line.replace(refRe, `${at} ${chalk__default['default'].bold('$1')} ${chalk__default['default'].gray('$2')}`)
  } else if (line.match(atRe)) {
    return line.replace(atRe, `${at} ${chalk__default['default'].gray('$1')}`)
  }
}

function createLogger (config = {}) {
  function addTypes (logger) {
    for (const type of logger.options.types) {
      logger[type.type] = function (...items) {
        this.name = type.type;
        return this.out(type, items)
      };
    }
  }

  function toOutputString (addNewline) {
    return (acc = '', msg, idx, src) => {
      if (merger.isPlainObject(msg)) return `${JSON.stringify(msg)}\n`
      const space = acc && !isANewLine(acc[acc.length - 1]) && !isANewLine(msg);
      const newline = addNewline && (idx === src.length - 1) ? '\n' : '';
      return acc + (msg ? (space ? ` ${msg}` : msg) : '') + newline
    }
  }

  function toNdjson (acc, msg, idx, src) {
    if (msg instanceof Error) {
      if (!acc.message) acc.message = msg.message;
      acc.error = msg.stack;
      acc.data = msg;
    } else if (merger.isPlainObject(msg)) {
      acc.data = merger.merge(acc.data || {}, msg);
    } else if (typeof msg === 'string') {
      acc.message = toOutputString(true)(acc.message, msg, idx, src).trim();
    } else if (typeof msg?.toString === 'function') {
      acc.message = toOutputString(true)(acc.message, msg.toString(), idx, src)
        .trim();
    }
    // FIXME: Handle other types of data.
    return acc
  }

  function format (log) {
    const styled = dotter.get(chalk__default['default'], log.style?.join('.'));

    log.items = log.items.reduce(
      (acc, item, index) => {
        const isFirst = index === 0;
        const isString = typeof item === 'string';

        // Split the item by newlines so the first item and rest can be
        // formatted differently.
        let rest = [];
        if (isString) {
          rest = item.split('\n');
          item = rest.shift();
        }

        if (item instanceof Error) {
          const { message, stack, ...err } = item;

          // Format the error message with the given color and make it bold,
          // unless it's already formatted using ANSI escape sequences.
          item = styled(`${item.constructor.name}: `);
          item += hasAnsi__default['default'](message) ? message : styled(message);

          // Format the error stacktrace.
          const stackLines = stack.split('\n').map(toStackLines);
          rest = rest.concat(stackLines.filter(byNotWhitespace));

          // Add the rest of the Error properties as a new item.
          if (Object.keys(err).length) {
            rest = rest.concat(prettify(err).split('\n'));
          }
        } else if (typeof item === 'object') {
          // If the item is an object, let chromafi format it.
          const items = prettify(item).split('\n');
          item = isFirst ? items.shift() : '';
          rest = rest.concat(items);
        } else {
          // If the item is not a string, turn it into one using util.inspect.
          if (!isString) item = util__default['default'].inspect(item);

          // If the item is the first item logged and isn't already formatted
          // using ANSI escape sequences, format it with the log style.
          if (isFirst && !hasAnsi__default['default'](item)) item = styled(item);
        }

        // Handle formatting an item that comes after a newline.
        if (isANewLine(acc[acc.length - 1])) item = toPaddedLine(item);

        // Add all the items back into the accumulator and return it.
        return acc.concat([item, ...rest.reduce(toPaddedItems, [])])
      },
      []
    );
  }

  function formatPlain (log) {
    format(log);
    log.items = log.items?.map(stripAnsi__default['default']);
  }

  const defaults = {
    types: [
      // For debugging code through log statements.
      { type: 'debug', level: 'debug', prefix: '🐛', style: ['magenta'] },
      // For standard log statements.
      { type: 'info', level: 'info', prefix: '💁', style: ['cyan', 'bold'] },
      // For general log statements in which you can customize the emoji.
      { type: 'log', level: 'info', prefix: extractLogPrefix },
      // For log statements indicating a successful operation.
      { type: 'success', level: 'info', prefix: '✅', style: ['green', 'bold'] },
      // For the gray area between info and error.
      { type: 'warn', level: 'warn', prefix: '⚠️', style: ['yellow', 'bold'] },
      // For normal errors.
      { type: 'error', level: 'error', prefix: '🚫', style: ['red', 'bold'] },
      // For unrecoverable errors.
      { type: 'fatal', level: 'fatal', prefix: '💀', style: ['red', 'bold'] },
      // For log statements in Markdown format.
      { type: 'md', format: formatMarkdown },
      // For plain text without an emoji or ANSI escape sequences.
      { type: 'plain', prefix: ' ', format: formatPlain },
      // For writing to the log without any formatting at all.
      { type: 'write', format: false }
    ],
    // Write all logs to stdout by default. You can change io.err if you would
    // like to write errors to stderr, for example.
    io: {
      out: process.stdout.write.bind(process.stdout),
      err: process.stdout.write.bind(process.stdout)
    },
    level: 'debug',
    unrestricted: (process.env.DEBUG || '').split(','),
    chalkLevel: chalk__default['default'].level || 2,
    ndjson: false,
    chromafi: { tabsToSpaces: 2, lineNumberPad: 0 },
    extraJson: [],
    extraItems: []
  };

  // Create the options Object by combinging defaults with the passed config.
  const options = merger.merge({}, defaults, config);

  // Set the chalk level if configured.
  if (options.chalkLevel) chalk__default['default'].level = options.chalkLevel;

  // Determine the position of the type with the configured log level so that
  // logger can determine if future logs should be logged or not.
  const levelIndex = options.types.findIndex(t => t.type === options.level);

  const logger = {
    options,
    // Determine if log items should be logged because it's namespace matches a
    // value in the "unrestricted" list.
    get unrestricted () {
      return this.options.namespace && this.options.unrestricted.some(ns => {
        return dotter.match(ns.trim(), this.options.namespace)
      })
    },
    create (options) {
      return createLogger(options)
    },
    update (options) {
      // Clean up obsolete log types.
      for (const t of this.options.types) {
        if (options.types && options.types.indexOf(t) === -1) delete this[t];
      }

      // Merge the passed options with the existing options.
      merger.merge(this.options, options);

      // Add the types to the logger instance now that the options are updated.
      addTypes(this);

      // Return the logger instance.
      return this
    },
    ns (namespace) {
      return this.create(merger.merge({}, this.options, { namespace }))
    },
    out (type, items) {
      try {
        // Create the log object.
        const log = { ...type, items };

        // Determine if the log item should be logged based on level.
        log.shouldLog = !type.level || options.types.indexOf(type) >= levelIndex;

        // Format and output the log if it has a high enough log level or has
        // been marked as unrestriected by the namespace functionality.
        if (log.shouldLog || this.unrestricted) {
          // If prefix is a function, get the prefix by calling the function
          // with the log items.
          if (typeof log.prefix === 'function') merger.merge(log, log.prefix(log));

          // Determine how many spaces should pad the prefix to separate it from
          // the log item. This is tricky because of weird emoji lengths.
          const pad = (log.prefix?.length || 0) + [...log.prefix || []].length;
          const spaceLength = log.prefix?.split(' ').length || 0;
          log.prefix = log.prefix?.padEnd(pad + spaceLength - 1);

          // Format the log items.
          if (options.ndjson) {
            log.items = log.items.reduce(toNdjson, {});
          } else if (log.format === undefined) {
            format(log);
          } else if (log.format) {
            log.format(log);
          }

          // Create an array of output items.
          let output;
          if (this.options.ndjson) {
            output = [{
              ...log.items,
              ...this.options.extraJson,
              message: log.items.message,
              level: log.level,
              type: log.type,
              namespace: this.options.namespace
            }];
          } else {
            const namespace = log.type === 'plain'
              ? this.options.namespace
              : chalk__default['default'].blue.bold(this.options.namespace);
            output = [
              log.prefix,
              ...this.options.extraItems,
              this.unrestricted ? `${namespace} •` : '',
              ...log.items
            ];
          }
          const isNotWrite = log.type !== 'write';
          const outputString = output.reduce(toOutputString(isNotWrite), '');

          // Output the string using configured io.
          if (options.io) {
            return new Promise(resolve => options.io[log.io || 'out'](
              outputString,
              () => resolve(outputString)
            ))
          }

          // Return the output string to the caller.
          return outputString
        }
      } catch (err) {
        // Fallback to console.error if an error thrown when trying to output
        // the log.
        console.error(err);
      }
    }
  };

  // Add the log types to the logger object.
  addTypes(logger);

  // Return the logger object for use.
  return logger
}

var index = { createLogger, chalk: chalk__default['default'], md };

Object.defineProperty(exports, 'chalk', {
  enumerable: true,
  get: function () {
    return chalk__default['default'];
  }
});
exports.createLogger = createLogger;
exports.default = index;
exports.md = md;
