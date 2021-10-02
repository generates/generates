const defaultformatter = lineNumber => `${lineNumber}.`

export function numberLine (line, index, maxLen, formatter = defaultformatter) {
  return `${formatter(index).padStart(maxLen, ' ')} ${line}`
}

export function numberLines (lines, formatter = defaultformatter) {
  const maxLen = formatter(lines.length).length
  return lines.map((line, i) => numberLine(line, i + 1, maxLen, formatter))
}
