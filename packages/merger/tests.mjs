import { test } from '@ianwalter/bff'
import { merge } from './index.mjs'

test('shallow Objects get merged', t => {
  const obj1 = { count: 1, color: 'green' }
  const obj2 = { count: 1, shape: 'triangle' }
  const obj3 = { count: 1, size: 'large' }
  const shallow = { ...obj1, ...obj2, ...obj3 }
  t.expect(merge(obj1, obj2, obj3)).toStrictEqual(shallow)
})

test('nested Objects get merged', async t => {
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
  t.expect(merged).toMatchSnapshot()
  t.expect(obj1).toMatchSnapshot()
  t.expect(obj2).toMatchSnapshot()
})

test('nested Arrays get replaced', t => {
  const obj1 = { count: 1, items: [1] }
  const obj2 = { count: 2, items: [2] }
  const obj3 = { count: 3, items: [3] }
  t.expect(merge(obj1, obj2, obj3)).toStrictEqual(obj3)
})

test('null values are not treated as objects', t => {
  const obj1 = { id: 'a', tools: { auto: { safety: ['Welding Gloves'] } } }
  const obj2 = { id: 'b', tools: { auto: null } }
  t.expect(merge(obj1, obj2)).toStrictEqual(obj2)
})

test('circulars', t => {
  function Podcast () {
    this.name = 'Beanicles'
    this.circular = this
  }
  function Episode () {
    this.episodeName = 'Choo Choo'
    this.episode = this
  }
  const merged = merge({}, new Podcast(), new Episode())
  t.expect(merged).toMatchSnapshot()
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

test('Object with a Date', t => {
  const date = new Date()
  const merged = merge({ user: 123 }, { date })
  const json = JSON.stringify(merged)
  t.expect(JSON.parse(json)).toEqual({ user: 123, date: date.toISOString() })
})

test('Object with a URL', t => {
  const url = new URL('https://ianwalter.dev/')
  const one = { name: 'Lowly' }
  const three = merge(one, { url })
  t.expect(three.name).toBe(one.name)
  t.expect(three.url).toBe(url)
})

test('URL', t => {
  const one = { name: 'Lowly' }
  const three = merge({}, one, new URL('https://ianwalter.dev/'))
  t.expect(three).toStrictEqual(one)
})

test('Prototype polution', t => {
  const obj = {}
  merge(obj, JSON.parse('{"__proto__":{"polluted":"Yes! It\'s polluted"}}'))
  t.expect({}.polluted).toBe(undefined)
})
