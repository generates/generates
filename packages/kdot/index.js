import { createLogger } from '@generates/logger'
import { core, apps } from './lib/k8sApi.js'

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
