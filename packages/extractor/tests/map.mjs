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
    shippingZip: 03045,
    shippingCountry: 'US'
  }
  const remapped = {
    address_line1: '123 Wharf Ave',
    address_line2: 'Suite 104A',
    city_locality: 'Red Hook',
    state_province: 'VI',
    postal_code: 03045,
    country_code: 'US'
  }
  let output = extractor.map(remapped, map)
  t.expect(output).toEqual(mapped)
  output = extractor.remap(output, map)
  t.expect(output).toEqual(remapped)
})
