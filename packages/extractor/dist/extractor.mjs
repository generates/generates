import clone from '@ianwalter/clone';
import { del, has, set, get } from '@generates/dotter';

function excluding (src, ...props) {
  const dest = clone(src);
  for (const prop of props) del(dest, prop);
  return dest
}

function including (src, ...props) {
  const dest = {};
  for (const prop of props) {
    if (has(src, prop)) set(dest, prop, get(src, prop));
  }
  return dest
}

function map (src, map) {
  const dest = {};
  const entries = Object.entries(map);
  for (const [key, val] of Object.entries(src)) {
    const [toKey] = entries.find(e => e[1] === key) || [];
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

export { excluding, including, key, map, remap };
