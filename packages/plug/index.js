import loadPluginFiles from './lib/loadPluginFiles.js'

export default async function plug (config = {}) {
  if (config.files) {
    // Load plugins from JS files.
    const plugins = await loadPluginFiles(config.files)
  }
}
