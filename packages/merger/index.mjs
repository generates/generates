export function isObject (i) {
  return Object.prototype.toString.call(i) === '[object Object]'
}

export function isPlainObject (i) {
  if (!isObject(i)) return false
  const pt = Object.getPrototypeOf(i)
  return pt === Object.prototype || pt === null
}

export function merge (...items) {
  const circulars = (this && this.circulars) || []
  const dest = items.shift()
  for (const src of items) {
    if (isObject(src)) {
      circulars.push({ dest, src })
      const props = Object.entries(Object.getOwnPropertyDescriptors(src))
      for (const [key, descriptor] of props) {
        if (key === '__proto__') continue
        const srcVal = src[key]
        const destVal = dest[key] || {}
        const circular = circulars.find(c => c.src === srcVal)
        if (isPlainObject(srcVal)) {
          descriptor.value = circular
            ? circular.dest
            : merge.call({ circulars }, destVal, srcVal)
          delete descriptor.get
          delete descriptor.set
        }
        if (srcVal !== undefined) Object.defineProperty(dest, key, descriptor)
      }
    }
  }
  return dest
}
