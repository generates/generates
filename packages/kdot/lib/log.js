import stream from 'stream'
import { createLogger, chalk } from '@generates/logger'
import { core, klog } from './k8sApi.js'

const logger = createLogger({ namespace: 'kdot', level: 'info' })

const colors = [
  'blue',
  'yellow',
  'magenta',
  'cyan',
  'red',
  'green',
  'white'
]

export default async function log (cfg) {
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

      for (const [index, pod] of pods.entries()) {
        const color = colors[index % 7]

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
