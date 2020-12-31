import { merge } from '@generates/merger'

export default function consolidateConfig (cfg) {
  // Load customization config.
  const custom = {}

  for (const base of cfg.services) {
    // Consolidate the service configuration.
    const service = merge(base, custom.service[base.name])

    //
  }
}
