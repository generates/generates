export default {
  namespace: 'example',
  apps: {
    web: {
      image: 'ianwalter/example',
      ports: [
        { port: 8000, localPort: 9000 }
      ],
      env: {
        PORT: '8000',
        APP_ENV: 'production'
      }
    }
  }
}
