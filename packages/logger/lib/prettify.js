import { emphasize } from 'emphasize'
import chalk from 'chalk'
import stringify from './stringify.js'
import { numberLines } from '@generates/number-lines'

const defaultOptions = {
  highlight: true,
  lineNumbers: true,
  indent: '  '
}
const formatLineNumber = lineNumber => chalk.dim(lineNumber)

export default function prettify (value, options = defaultOptions) {
  if (typeof value === 'object') {
    value = stringify(value, { indent: options.indent })
  }
  if (options.highlight) {
    const res = emphasize.highlightAuto(value)
    value = res.value

    if (options.lineNumbers) {
      value = numberLines(value.split('\n'), formatLineNumber).join('\n')
    }
  }
  return value
}
