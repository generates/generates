import { test } from '@ianwalter/bff'
import generatesLicense from './index.js'

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
