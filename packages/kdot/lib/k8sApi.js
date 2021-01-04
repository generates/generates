import k8s from '@kubernetes/client-node'

const kc = new k8s.KubeConfig()
kc.loadFromDefault()

export const core = kc.makeApiClient(k8s.CoreV1Api)
export const apps = kc.makeApiClient(k8s.AppsV1Api)
export const pfwd = new k8s.PortForward(kc)
export const klog = new k8s.Log(kc)
