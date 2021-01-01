import { createLogger } from '@generates/logger'
import k8sApi from './lib/k8sApi.js'

const logger = createLogger({ namespace: 'kdot', level: 'info' })

/**
 * Add configured services to the cluster.
 */
export async function apply (cfg) {
  for (const resource of cfg.resources) {
    if (resource.kind === 'Namespace') {
      if (!resource.metadata.uid) {
        resource.metadata.createdBy = 'kdot'
        try {
          await k8sApi.createNamespace(resource)
          logger.info('Created Namespace:', resource.metadata.name)
        } catch (err) {
          const level = cfg.input.failFast ? 'fatal' : 'error'
          logger[level]('Failed to create Namespace:', resource.metadata.name)
          logger.error(err.response?.body?.message)
          if (level === 'fatal') process.exit(1)
        }
      }
    }
  }
}

/**
 * Setup port forwarding between configured services in the cluster and the
 * local host.
 */
export async function forward (cfg) {

}

/**
 * Add configured services to the cluster and port forward them to the local
 * host.
 */
export async function up (cfg) {
  await apply(cfg)
  await forward(cfg)
}

/**
 * Stop port forwarding services in the cluster to the local host.
 */
export async function unforward (cfg) {
}

/**
 * Remove ephemeral services from the cluster.
 */
export async function remove (cfg) {
}

/**
 * Stop port forwarding and delete ephemeral services from the cluster.
 */
export async function down (cfg) {
  await unforward(cfg)
  await remove(cfg)
}
