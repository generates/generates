import net from 'net'
import { createLogger } from '@generates/logger'
import killable from 'killable'
import { oneLine } from 'common-tags'
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

      // TODO: Find a pod from the service and port forward to it.

      const { body: { items: [pod] } } = await core.listNamespacedPod(
        namespace,
        undefined,
        undefined,
        undefined,
        undefined,
        `app=${name}`
      )

      for (const p of resource.spec.ports) {
        await new Promise((resolve, reject) => {
          const server = net.createServer(socket => {
            fwd.portForward(
              namespace,
              pod.metadata.name,
              [p.targetPort],
              socket,
              undefined,
              socket
            )
          })

          killable(server)

          server.on('error', err => {
            server.kill()
            reject(err)
          })

          server.listen(p.port, 'localhost', () => {
            logger.success(oneLine`
              Forwarding http://localhost:${p.port} to
              ${pod.metadata.name}:${p.targetPort}
            `)
            resolve()
          })
        })
      }
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
