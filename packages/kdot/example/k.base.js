export default {
  namespace: 'example',
  apps: {
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
