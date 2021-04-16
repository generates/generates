export default function dbPlugin (plug) {
  plug.in('plugin', app => {
    app.db = {
      get () {
        return [3, 6, 9]
      }
    }
  })
}
