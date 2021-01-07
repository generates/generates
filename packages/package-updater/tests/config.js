import execa from 'execa'

export default {
  async beforeEach () {
    await execa('mkdir', ['-p', 'tests/tmp'])
    await execa('cp', ['tests/fixtures/package.json', 'tests/tmp'])
  }
}
