#!/usr/bin/env node

import generatesLicense from './index.js'
import { createLogger } from '@generates/logger'

const logger = createLogger()

async function run () {
  const { license } = await generatesLicense.generate({ dryRun: true })
  logger.log('')
  logger.success('License:')
  logger.log('')
  logger.log(license.content)
}

run()
