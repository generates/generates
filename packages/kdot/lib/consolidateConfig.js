import { merge } from '@generates/merger'
import { createLogger } from '@generates/logger'
import k8sApi from './k8sApi.js'

const logger = createLogger({ namespace: 'kdot', level: 'info' })

export default async function consolidateConfig (input) {
  const { default: base } = await import(input.base)

  let custom
  try {
    const mod = await import(input.custom)
    custom = mod.default
  } catch (_) {}

  const cfg = merge({ namespace: 'default', input }, base, custom, input.ext)

  logger.debug('Initial configuration', cfg)

  // Initialize the array of resources.
  cfg.resources = []

  // If there is a top-level namespace, add it to the resources array.
  if (cfg.namespace !== 'default') {
    cfg.resources.push({ kind: 'Namespace', metadata: { name: cfg.namespace } })
  }

  // Break services down into individual Kubernetes resources.
  for (const [name, service] of Object.entries(cfg.services)) {
    if (!service.disabled) {
      // If a namespace isn't specified for the service, assign the top-level
      // namespace to it.
      if (!service.namespace) service.namespace = cfg.namespace

      // If there is a service-level namespace that is different from the
      // top-level namespace, add it to the resources array.
      if (service.namespace !== cfg.namespace) {
        cfg.resources.push({
          kind: 'Namespace',
          metadata: { name: service.namespace }
        })
      }
    }
  }

  // Mark namespaces that already exist in the cluster.
  const namespaces = cfg.resources.filter(r => r.kind === 'namespace')
  if (namespaces.length) {
    const { body: { items } } = await k8sApi.listNamespace()
    for (const namespace of namespaces) {
      const { name } = namespace.metadata
      const existing = items.find(n => n.metadata.name === name)
      if (existing) merge(namespace, existing, { exists: true })
    }
  }

  logger.debug('Resources', cfg.resources)

  return cfg
}
