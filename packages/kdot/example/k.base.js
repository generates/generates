export default {
  namespace: 'example',
  services: {
    web: {
      name: 'web',
      image: 'ianwalter/example-web',
      public: true,
      ports: [
        { port: 8000, localPort: 9000 }
      ],
      environment: {
        APP_ENV: 'production'
      }
    }
  }
}
