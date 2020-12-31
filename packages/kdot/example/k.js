import { provision } from '../index.js'

const web = {
  name: 'web',
  image: 'ianwalter/example-web',
  ports: [8000]
}

provision({
  namespace: 'example',
  resources: [web]
})
