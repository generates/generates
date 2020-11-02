export function isPlainObject (item) {
  return item &&
    typeof item === 'object' &&
    Object.getPrototypeOf(item) === Object.prototype
}

export function merge (...items) {
  const circulars = (this && this.circulars) || []
  const destination = items.shift()
  for (const item of items) {
    if (isPlainObject(item)) {
      circulars.push(item)
      const props = Object.entries(Object.getOwnPropertyDescriptors(item))
      for (const [key, descriptor] of props) {
        if (key === '__proto__' || key === 'constructor' || key === 'prototype') 
        return;
        const srcVal = item[key]
        const destVal = destination[key] || {}
        if (circulars.includes(srcVal)) {
          continue
        } else if (isPlainObject(srcVal)) {
          descriptor.value = merge.call({ circulars }, destVal, srcVal)
          delete descriptor.get
          delete descriptor.set
        }
        if (srcVal !== undefined) {
          Object.defineProperty(destination, key, descriptor)
        }
      }
    }
  }
  return destination
}
