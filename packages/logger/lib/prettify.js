import { emphasize } from 'emphasize'
import chalk from 'chalk'
import stringify from './stringify.js'

const defaultOptions = {
  highlight: true,
  lineNumbers: true,
  indent: '  '
}

export default function prettify (value, options = defaultOptions) {
  if (typeof value === 'object') {
    value = stringify(value, { indent: options.indent })
  }
  if (options.highlight) {
    const res = emphasize.highlightAuto(value)
    value = res.value

    if (options.lineNumbers) {
      // TODO: padStart based on line length.
      value = value.split('\n').map((line, i) => {
        const lineNumber = i + 1
        return `${chalk.dim(lineNumber)} ${line}`
      }).join('\n')
    }
  }
  return value
}
