import { test } from '@ianwalter/bff'
import * as extractor from '../dist/extractor.mjs'

test('map and remap', t => {
  const map = {
    shippingStreet: 'address_line1',
    shippingStreet2: 'address_line2',
    shippingCity: 'city_locality',
    shippingState: 'state_province',
    shippingZip: 'postal_code',
    shippingCountry: 'country_code'
  }
  const mapped = {
    shippingStreet: '123 Wharf Ave',
    shippingStreet2: 'Suite 104A',
    shippingCity: 'Red Hook',
    shippingState: 'VI',
    shippingZip: '03045',
    shippingCountry: 'US'
  }
  const remapped = {
    address_line1: '123 Wharf Ave',
    address_line2: 'Suite 104A',
    city_locality: 'Red Hook',
    state_province: 'VI',
    postal_code: '03045',
    country_code: 'US'
  }

  let output = extractor.map(remapped, map)
  t.expect(output).toEqual(mapped)
  t.expect(output).not.toBe(mapped)

  output = extractor.remap(output, map)
  t.expect(output).toEqual(remapped)
  t.expect(output).not.toBe(remapped)

  output.phone = '55555555555'
  output = extractor.map(extractor.excluding(output, 'country_code'), map)
  t.expect(output).toEqual(extractor.excluding(mapped, 'shippingCountry'))

  output.phone = '55555555555'
  output = extractor.remap(output, map)
  t.expect(output).toEqual(extractor.excluding(remapped, 'country_code'))
})

test('map array', t => {
  const items = [
    { id: 'abc', name: 'Gabriel' },
    { id: 'def', name: 'Myke' },
    { id: 'ghi', name: 'Joanna' }
  ]

  // Map to id.
  let map = extractor.map(items)
  t.expect(map).toEqual({ abc: items[0], def: items[1], ghi: items[2] })

  // Map to name.
  map = extractor.map(items, 'name')
  t.expect(map).toEqual({ Gabriel: items[0], Myke: items[1], Joanna: items[2] })
})
