import { core } from './k8sApi.js'

/**
 * Remove ephemeral apps from the cluster.
 */
export default async function del (cfg) {
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
