#!/usr/bin/env node

const prompt = require('.')
const { createLogger } = require('@generates/logger')

const logger = createLogger()

async function run () {
  let response = await prompt.text('What is your favorite dinosaur?')
  logger.log('')
  logger.success('Response:', response)

  response = await prompt.text('What is your name?', { fallback: 'Ian' })
  logger.log('')
  logger.success('Response:', `${response}`)

  response = await prompt.select('Is it really cold?')
  logger.log('')
  logger.success('Response:', `${response}`)

  const options = ['red', 'green', 'blue']
  response = await prompt.multiselect('What colors do you like?', { options })
  logger.log('')
  logger.success('Response:', response.join(', '))

  response = await prompt.editor('Write a story!', { prefill: '[Insert Here]' })
  logger.success('Response:')
  logger.log(response)
}

run()
