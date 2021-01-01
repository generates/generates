import k8s from '@kubernetes/client-node'
import consolidateConfig from './lib/consolidateConfig.js'

/**
 * Add configured services to the cluster.
 */
export async function apply (cfg) {
  // Make sure the config has been consolidated into the a single set of values.
  consolidateConfig(cfg)

  if (cfg.namespace) {
    // Check if the namespace exists.

    // Create namespace if it doesn't exist.
  }

  for (const service of cfg.services) {
    //
    if (service.enabled) {}
  }
}

/**
 * Setup port forwarding between configured services in the cluster and the
 * local host.
 */
export async function forward (cfg) {
  // Make sure the config has been consolidated into the a single set of values.
  consolidateConfig(cfg)
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
  // Make sure the config has been consolidated into the a single set of values.
  consolidateConfig(cfg)
}

/**
 * Remove ephemeral services from the cluster.
 */
export async function unapply (cfg) {
  // Make sure the config has been consolidated into the a single set of values.
  consolidateConfig(cfg)
}

/**
 * Stop port forwarding and delete ephemeral services from the cluster.
 */
export async function down (cfg) {
  await unforward(cfg)
  await unapply(cfg)
}
