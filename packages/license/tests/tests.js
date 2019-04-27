const { test } = require('@ianwalter/bff')
const GeneratesLicense = require('..')

test('Generating an ISC license', async ({ expect }) => {
  const generatesLicense = new GeneratesLicense({
    answers: {
      license: 'ISC',
      authorName: 'Ian Walter',
      authorEmail: 'public@iankwalter.com',
      authorUrl: 'https://iankwalter.com'
    }
  })
  expect(await generatesLicense.generate()).toMatchSnapshot()
})
