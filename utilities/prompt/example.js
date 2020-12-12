#!/usr/bin/env node

const prompt = require('.')
const { print } = require('@ianwalter/print')

async function run () {
  let response = await prompt.text('What is your favorite dinosaur?')
  print.log('')
  print.success('Response:', response)

  response = await prompt.text('What is your name?', { fallback: 'Ian' })
  print.log('')
  print.success('Response:', `${response}`)

  response = await prompt.select('Is it really cold?')
  print.log('')
  print.success('Response:', `${response}`)

  const options = ['red', 'green', 'blue']
  response = await prompt.multiselect('What colors do you like?', { options })
  print.log('')
  print.success('Response:', response.join(', '))

  response = await prompt.editor('Write a story!', { prefill: '[Insert Here]' })
  print.success('Response:')
  print.log(response)
}

run()
