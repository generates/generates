'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function isObject (i) {
  return Object.prototype.toString.call(i) === '[object Object]'
}

function isPlainObject (i) {
  if (!isObject(i)) return false
  const pt = Object.getPrototypeOf(i);
  return pt === Object.prototype || pt === null
}

function merge (...items) {
  const circulars = (this && this.circulars) || [];
  const destination = items.shift();
  for (const item of items) {
    if (isObject(item)) {
      circulars.push(item);
      const props = Object.entries(Object.getOwnPropertyDescriptors(item));
      for (const [key, descriptor] of props) {
        if (key === '__proto__' || key === 'constructor') continue
        const srcVal = item[key];
        const destVal = destination[key] || {};
        if (circulars.includes(srcVal)) {
          continue
        } else if (isPlainObject(srcVal)) {
          descriptor.value = merge.call({ circulars }, destVal, srcVal);
          delete descriptor.get;
          delete descriptor.set;
        }
        if (srcVal !== undefined) {
          Object.defineProperty(destination, key, descriptor);
        }
      }
    }
  }
  return destination
}

exports.isObject = isObject;
exports.isPlainObject = isPlainObject;
exports.merge = merge;
