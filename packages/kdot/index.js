import stream from 'stream'
import net from 'net'
import { createLogger, chalk } from '@generates/logger'
import killable from 'killable'
import { oneLine } from 'common-tags'
import { core, apps, pfwd, klog } from './lib/k8sApi.js'

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
          logger.success('Updated Deployment:', name)
        } else {
          await apps.createNamespacedDeployment(namespace, resource)
          logger.success('Created Deployment:', name)
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
          logger.success('Updated Service:', name)
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
export async function fwd (cfg) {
  try {
    for (const service of cfg.services) {
      const { name, namespace } = service.metadata

      // FIXME: Maybe we can implement our own local load balancer to simulate
      // the service and distribute traffic to all of the pods instead of just
      // the first one.
      const { body: { items: [pod] } } = await core.listNamespacedPod(
        namespace,
        undefined,
        undefined,
        undefined,
        undefined,
        `app=${name}`
      )

      for (const p of service.spec.ports) {
        await new Promise((resolve, reject) => {
          const server = net.createServer(socket => {
            pfwd.portForward(
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
  await fwd(cfg)
}

/**
 * Remove ephemeral apps from the cluster.
 */
export async function del (cfg) {
  if (cfg.namespace !== 'default') {
    await core.deleteNamespace(
      cfg.namespace,
      undefined,
      undefined,
      undefined,
      undefined,
      'Foreground'
    )
    logger.success('Deleted resources in namespace:', cfg.namespace)
  }

  // await Promise.allSettled(cfg.resources.map(async resource => {
  //   const { name, namespace } = resource.metadata
  //   try {
  //     if (resource.kind === 'Deplyoment') {
  //       await apps.deleteNamespacedDeployment(
  //         name,
  //         namespace,
  //         undefined,
  //         undefined,
  //         undefined,
  //         undefined,
  //         undefined,
  //         'Foreground'
  //       )
  //       logger.success('Removed Deployment:', name)
  //     } else if (resource.kind === 'Service') {
  //       await core.deleteNamespacedService(name, namespace)
  //       logger.success('Removed Service:', name)
  //     }
  //   } catch (err) {
  //     logger.error(err)
  //   }
  // }))

  // await Promise.allSettled(cfg.namespaces.map(async ns => {
  //   try {
  //     await core.deleteNamespace(ns.metadata.name)
  //   } catch (err) {
  //     logger.error(err)
  //   }
  // }))
}

/**
 * Build images
 */
export async function build (cfg) {
}

const colors = [
  'blue',
  'yellow',
  'magenta',
  'cyan',
  'red',
  'green',
  'white'
]

export async function log (cfg) {
  try {
    for (const deployment of cfg.deployments) {
      const { name, namespace } = deployment.metadata

      const { body: { items: pods } } = await core.listNamespacedPod(
        namespace,
        undefined,
        undefined,
        undefined,
        undefined,
        `app=${name}`
      )

      let i = 0
      for (const pod of pods) {
        const color = colors[i % 7]
        i++

        await new Promise((resolve, reject) => {
          klog.log(
            namespace,
            pod.metadata.name,
            undefined,
            new stream.Transform({
              transform (chunk, encoding, callback) {
                const msg = chunk.toString()
                const preface = msg.slice(0, 4)
                const rest = msg.slice(4)
                const name = chalk.bold[color](pod.metadata.name)
                process.stdout.write(preface + `${name} • ` + rest)
                callback()
              }
            }),
            err => {
              if (err) return reject(err)
              resolve()
            },
            { follow: true }
          )
        })
      }
    }
  } catch (err) {
    logger.error(err)
  }
}

export async function start (cfg) {
  await apply(cfg)
  await fwd(cfg)
  await log(cfg)
}
