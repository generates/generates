export default function dbPlugin (plug) {
  plug.in('plugin', function db (app, next) {
    app.db = {
      get () {
        return [3, 6, 9]
      }
    }
    return next()
  })
}
