'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var merger = require('@generates/merger');
var dotter = require('@generates/dotter');

function excluding (src, ...props) {
  const dest = merger.merge({}, src);
  for (const prop of props) dotter.del(dest, prop);
  return dest
}

function including (src, ...props) {
  const dest = {};
  for (const prop of props) {
    if (dotter.has(src, prop)) dotter.set(dest, prop, dotter.get(src, prop));
  }
  return dest
}

function map (src, map = 'id') {
  const dest = {};
  const isString = typeof map === 'string';
  const keys = !isString && Object.keys(map);

  for (const [key, val] of Object.entries(src)) {
    const toKey = isString ? val[map] : keys.find(k => map[k] === key);
    if (toKey) dest[toKey] = val;
  }

  return dest
}

function remap (src, map) {
  const dest = {};
  for (const [key, val] of Object.entries(src)) {
    if (key in map) dest[map[key]] = val;
  }
  return dest
}

function key (src, value) {
  return Object.keys(src).find(key => src[key] === value)
}

exports.excluding = excluding;
exports.including = including;
exports.key = key;
exports.map = map;
exports.remap = remap;
