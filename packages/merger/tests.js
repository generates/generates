const { test } = require('@ianwalter/bff')
const merger = require('.')

// Just to make sure it works when destructured as well.
const { merge } = merger

test('shallow Objects get merged', ({ expect }) => {
  const obj1 = { count: 1, color: 'green' }
  const obj2 = { count: 1, shape: 'triangle' }
  const obj3 = { count: 1, size: 'large' }
  const shallow = { ...obj1, ...obj2, ...obj3 }
  expect(merger.merge(obj1, obj2, obj3)).toStrictEqual(shallow)
})

test('nested Objects get merged', async ({ expect }) => {
  const obj1 = {
    shouldThrow: true,
    logLevel: 'info',
    headers: {
      'user-agent': '@ianwalter/requester'
    },
    timeout: 60000
  }
  const obj2 = {
    headers: {
      'content-type': 'application/json',
      'content-length': '18'
    }
  }
  const merged = merge({}, obj1, obj2)
  expect(merged).toMatchSnapshot()
  expect(obj1).toMatchSnapshot()
  expect(obj2).toMatchSnapshot()
})

test('nested Arrays get replaced', ({ expect }) => {
  const obj1 = { count: 1, items: [1] }
  const obj2 = { count: 1, items: [2] }
  const obj3 = { count: 1, items: [3] }
  expect(merge(obj1, obj2, obj3)).toStrictEqual(obj3)
})

test('null values are not treated as objects', ({ expect }) => {
  const obj1 = { id: 'a', tools: { auto: { safety: ['Welding Gloves'] } } }
  const obj2 = { id: 'b', tools: { auto: null } }
  expect(merge(obj1, obj2)).toStrictEqual(obj2)
})

test('Object with getters', t => {
  const one = {
    likeThis: 'always',
    get line () {
      return `it's ${this.likeThis} been like this`
    },
    get refrain () {
      return { text: `${this.likeThis} like this`, times: 5 }
    }
  }
  const two = {
    likeThis: 'never',
    line: 'We can do this every night, you can be my ride or die',
    refrain: { times: 4 },
    get time () {
      const length = (this.refrain.text && this.refrain.text.length) || 0
      return length * this.refrain.times
    }
  }
  merge(one, two)
  t.expect(one.likeThis).toBe(two.likeThis)
  t.expect(one.line).toBe(two.line)
  t.expect(one.refrain).toEqual({ text: 'never like this', times: 4 })
  t.expect(one.time).toBe(60)
})

test('Object with a date', t => {
  const date = new Date()
  const merged = merger.merge({ user: 123 }, { date })
  const json = JSON.stringify(merged)
  t.expect(JSON.parse(json)).toEqual({ user: 123, date: date.toISOString() })
})
