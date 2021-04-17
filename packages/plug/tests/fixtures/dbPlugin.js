export default function setupDbPlugin (plug) {
  plug.in('plugin', function dbPlugin (app, next) {
    app.db = {
      get () {
        return [3, 6, 9]
      }
    }
    return next()
  })
}
