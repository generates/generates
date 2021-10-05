import { test } from '@ianwalter/bff'
import { numberLines } from './index.js'

test('numberLines', async t => {
  const numberedLines = numberLines([
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten'
  ])
  await t.logger.log(numberedLines.join('\n'))
  t.expect(numberedLines).toEqual([
    ' 1. One',
    ' 2. Two',
    ' 3. Three',
    ' 4. Four',
    ' 5. Five',
    ' 6. Six',
    ' 7. Seven',
    ' 8. Eight',
    ' 9. Nine',
    '10. Ten'
  ])
})
