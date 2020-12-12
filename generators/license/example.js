#!/usr/bin/env node

const generatesLicense = require('.')
const { createLogger } = require('@generates/logger')

const logger = createLogger()

async function run () {
  const { license } = await generatesLicense.generate({ dryrun: true })
  logger.log('')
  logger.success('License:')
  logger.log('')
  logger.log(license.content)
}

run()
