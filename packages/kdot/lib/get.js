import { createLogger } from '@generates/logger'
import * as dotter from '@generates/dotter'

const logger = createLogger({ namespace: 'kdot', level: 'info' })

export default async function get (cfg) {
  try {
    const [path] = cfg.input.args
    logger.info(`cfg.${path}:`, dotter.get(cfg, path))
  } catch (err) {
    logger.error(err)
  }
}
