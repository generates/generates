import chromafi from '../index.js'

const obj = {foobar: 1337}

const options = {
  lineNumberPad: 0,
  codePad: 0,
  indent: 2,
  lineNumbers: true,
  colors: {
    BASE: ['bgBlack', 'white', 'bold'],
    LINE_NUMBERS: ['bgCyan', 'black']
  }
}

console.log(chromafi(obj, options))
