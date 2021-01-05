import execa from 'execa'

export default {
  async beforeEach () {
    await execa('cp', ['tests/fixtures/package.json', 'tests/tmp'])
  }
}
