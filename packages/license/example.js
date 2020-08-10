#!/usr/bin/env node

const generatesLicense = require('.')

async function run () {
  const files = await generatesLicense.generate()
  console.log('files', files)
}

run()
