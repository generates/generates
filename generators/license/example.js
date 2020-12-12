#!/usr/bin/env node

const generatesLicense = require('.')
const { print } = require('@ianwalter/print')

async function run () {
  const { license } = await generatesLicense.generate({ dryrun: true })
  print.log('')
  print.success('License:')
  print.log('')
  print.log(license.content)
}

run()
