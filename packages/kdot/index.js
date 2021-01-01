import k8s from '@kubernetes/client-node'

/**
 * Add configured services to the cluster.
 */
export async function apply (cfg) {
  if (cfg.namespace) {
    // Check if the namespace exists.

    // Create namespace if it doesn't exist.
  }

  for (const [name, resource] of Object.entries(cfg.resources)) {
    //
    for
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
