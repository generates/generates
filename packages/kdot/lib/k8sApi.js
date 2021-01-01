import k8s from '@kubernetes/client-node'

const kc = new k8s.KubeConfig()
kc.loadFromDefault()

export default kc.makeApiClient(k8s.CoreV1Api)
