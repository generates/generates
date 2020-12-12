const { test } = require('@ianwalter/bff')
const generatesLicense = require('.')

test('Generating an ISC license', async t => {
  const { files } = await generatesLicense.generate({
    dryRun: true,
    data: {
      license: { name: 'ISC' },
      licensor: {
        name: 'Ian Walter',
        email: 'pub@ianwalter.dev',
        url: 'https://ianwalter.dev'
      }
    }
  })
  t.expect(files).toMatchSnapshot()
})
