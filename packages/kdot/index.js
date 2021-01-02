import { createLogger } from '@generates/logger'
import { core, apps, fwd } from './lib/k8sApi.js'

const logger = createLogger({ namespace: 'kdot', level: 'info' })

/**
 * Add configured apps to the cluster.
 */
export async function apply (cfg) {
  for (const resource of cfg.resources) {
    const { uid, name, namespace } = resource.metadata
    try {
      if (resource.kind === 'Namespace') {
        if (!uid) {
          await core.createNamespace(resource)
          logger.info('Created Namespace:', name)
        }
      } else if (resource.kind === 'Deployment') {
        if (uid) {
          await apps.patchNamespacedDeployment(
            name,
            namespace,
            resource,
            undefined,
            undefined,
            undefined,
            undefined,
            { headers: { 'Content-Type': 'application/merge-patch+json' } }
          )
          logger.info('Updated Deployment:', name)
        } else {
          await apps.createNamespacedDeployment(namespace, resource)
          logger.info('Created Deployment:', name)
        }
      } else if (resource.kind === 'Service') {
        if (uid) {
          await core.patchNamespacedService(
            name,
            namespace,
            resource,
            undefined,
            undefined,
            undefined,
            undefined,
            { headers: { 'Content-Type': 'application/merge-patch+json' } }
          )
          logger.info('Updated Service:', name)
        } else {
          await core.createNamespacedService(namespace, resource)
          logger.info('Created Service:', name)
        }
      }
    } catch (err) {
      const level = cfg.input.failFast ? 'fatal' : 'error'
      logger[level](`Failed to apply ${resource.kind}:`, name)
      logger.error(err.response?.body?.message || err)
      if (level === 'fatal') process.exit(1)
    }
  }
}

/**
 * Setup port forwarding between configured apps in the cluster and the
 * local host.
 */
export async function forward (cfg) {
  try {
    for (const resource of cfg.resources.filter(r => r.kind === 'Service')) {
      const { name, namespace } = resource.metadata
      const ports = resource.spec.ports.map(p => p.port)

      // TODO: Find a pod from the service and port forward to it.

      await fwd.portForward(namespace, name, ports)
    }
  } catch (err) {
    logger.error(err)
  }
}

/**
 * Add configured apps to the cluster and port forward them to the local
 * host.
 */
export async function up (cfg) {
  await apply(cfg)
  await forward(cfg)
}

/**
 * Stop port forwarding apps in the cluster to the local host.
 */
export async function unforward (cfg) {
}

/**
 * Remove ephemeral apps from the cluster.
 */
export async function remove (cfg) {
}

/**
 * Stop port forwarding and delete ephemeral apps from the cluster.
 */
export async function down (cfg) {
  await unforward(cfg)
  await remove(cfg)
}
