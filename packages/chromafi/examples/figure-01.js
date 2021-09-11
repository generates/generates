import chromafi from '../index.js'

const obj = {
  foo: 'bar',
  baz: 1337,
  qux: true,
  zxc: null,
  'foogle-bork': function (a, b) {
    return b - a
  }
}

console.log(chromafi(obj))
