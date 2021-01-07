import apply from './lib/apply.js'
import fwd from './lib/fwd.js'
import log from './lib/log.js'
import del from './lib/del.js'
import set from './lib/set.js'
import get from './lib/get.js'

export {
  apply,
  fwd,
  log,
  del,
  set,
  get
}

export async function start (cfg) {
  await apply(cfg)
  await fwd(cfg)
  await log(cfg)
}
