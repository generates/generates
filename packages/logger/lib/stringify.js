// Modified from: https://github.com/yeoman/stringify-object

import isRegexp from 'is-regexp'
import isObject from 'is-obj'
import { stripIndent } from 'common-tags'

// Modified from: https://github.com/mightyiam/get-own-enumerable-property-symbols
function getOwnEnumPropSymbols (obj) {
  return Object
    .getOwnPropertySymbols(obj)
    .filter(key => Object.prototype.propertyIsEnumerable.call(obj, key))
}

export default function stringify (input, options, pad) {
  const seen = []

  return (function stringify (input, options = {}, pad = '') {
    const indent = options.indent || '  '

    const tokens = {
      pad,
      indent: pad + indent
    }

    if (seen.includes(input)) return '"[Circular]"'

    if (
      input === null ||
      input === undefined ||
      typeof input === 'number' ||
      typeof input === 'boolean' ||
      typeof input === 'function' ||
      typeof input === 'symbol' ||
      isRegexp(input)
    ) {
      return String(input)
    }

    if (input instanceof Date) return `new Date('${input.toISOString()}')`

    if (input instanceof Error) {
      const obj = { ...input }
      const hasExtraProps = Object.keys(obj)
      return stripIndent`
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

      seen.push(input)

      const returnValue = '[\n' + input.map((element, i) => {
        const eol = input.length - 1 === i ? '\n' : ',\n'

        let value = stringify(element, options, pad + indent)
        if (options.transform) value = options.transform(input, i, value)

        return tokens.indent + value + eol
      }).join('') + tokens.pad + ']'

      seen.pop()

      return returnValue
    }

    if (isObject(input)) {
      let objectKeys = [
        ...Object.keys(input),
        ...getOwnEnumPropSymbols(input)
      ]

      if (options.filter) {
        objectKeys = objectKeys
          .filter(element => options.filter(input, element))
      }

      if (objectKeys.length === 0) return '{}'

      seen.push(input)

      const returnValue = '{\n' + objectKeys.map((el, i) => {
        const eol = objectKeys.length - 1 === i ? '\n' : ',\n'
        const isSymbol = typeof element === 'symbol'
        const isClassic = !isSymbol && /^[a-z$_][$\w]*$/i.test(el)
        const key = isSymbol || isClassic ? el : stringify(el, options)

        let value = stringify(input[el], options, pad + indent)
        if (options.transform) value = options.transform(input, el, value)

        return tokens.indent + String(key) + ': ' + value + eol
      }).join('') + tokens.pad + '}'

      seen.pop()

      return returnValue
    }

    input = String(input).replace(/[\r\n]/g, x => x === '\n' ? '\\n' : '\\r')

    if (options.singleQuotes === false) {
      input = input.replace(/"/g, '\\"')
      return `"${input}"`
    }

    input = input.replace(/\\?'/g, '\\\'')
    return `'${input}'`
  })(input, options, pad)
}
