import { createLogger } from '@generates/logger'
import * as dotter from '@generates/dotter'
import { update } from '@generates/package-updater'

const logger = createLogger({ namespace: 'kdot', level: 'info' })

export default async function set (cfg) {
  try {
    const [path, value] = cfg.input.args
    await update({ kdot: dotter.set({}, path, value) })
    logger.success(`Set ${path} to ${value}`)
  } catch (err) {
    logger.error(err)
  }
}
