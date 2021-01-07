import readPkgUp from 'read-pkg-up'
import { merge } from '@generates/merger'
import writePkg from 'write-pkg'

export async function update (updates, options = {}) {
  // Read the package.json if it hasn't been passed.
  let path = options.cwd || '.'
  if (!options.package) {
    const readOpts = { cwd: options.cwd, normalize: false }
    const { package: readPackage, path: readPath } = await readPkgUp(readOpts)
    options.package = readPackage
    path = readPath
  }

  // Merge the updates with the existing package.json schema.
  merge(options.package, updates)

  // Write the updated schema back to the package.json.
  await writePkg(path, options.package)
}
