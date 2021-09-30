#!/usr/bin/env node

import prompt from './index.js'
import { createLogger } from '@generates/logger'

const logger = createLogger()

async function run () {
  let response = await prompt.text('What is your favorite dinosaur?')
  logger.success('Response:', response, '\n')

  response = await prompt.text('What is your name?', { fallback: 'Ian' })
  logger.success('Response:', `${response}`, '\n')

  response = await prompt.select('Is it really cold?')
  logger.success('Response:', `${response}`, '\n')

  const options = ['red', 'green', 'blue']
  response = await prompt.multiselect('What colors do you like?', { options })
  logger.success('Response:', response.join(', '), '\n')

  response = await prompt.editor('Write a story!', { prefill: '[Insert Here]' })
  logger.success('Response:')
  logger.log(response)
}

run()
