const k8s = require('@pulumi/kubernetes')

module.exports = async function createActionsRunner (config = {}) {
  const {
    name = 'actions-runner',
    namespace,
    replicas = 1
  } = config
  const labels = { app: name }

  return new k8s.apps.v1.Deployment(
    name,
    {
      metadata: { namespace },
      spec: {
        selector: { matchLabels: labels },
        replicas,
        template: {
          metadata: { labels },
          spec: {
            containers: [
              {
                name,
                image: 'ianwalter/actions-runner',
                env: []
              }
            ]
          }
        }
      }
    }
  )
}
