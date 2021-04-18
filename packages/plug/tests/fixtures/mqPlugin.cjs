module.exports = function mqPlugin (plug) {
  plug.in('plugin', function mq (app, next) {
    app.mq = {
      send (name, payload) {
        process.emit(name, payload)
      }
    }
    return next()
  })
}
