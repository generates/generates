export default {
  namespace: 'example',
  services: {
    web: {
      image: 'ianwalter/example-web',
      ports: [
        { port: 8000, localPort: 9000 }
      ],
      environment: {
        APP_ENV: 'production'
      }
    }
  }
}
