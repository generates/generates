import execa from 'execa'

export default function (plug) {
  plug.in('beforeTest', async function createTempPackageJson (ctx, next) {
    await execa('mkdir', ['-p', 'tests/tmp'])
    await execa('cp', ['tests/fixtures/package.json', 'tests/tmp'])
    return next()
  })
}
