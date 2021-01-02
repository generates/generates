export default {
  namespace: 'example',
  apps: {
    web: {
      image: 'registry.digitalocean.com/anchormap/test',
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
