#!/usr/bin/env node

const prompt = require('.')
const { print } = require('@ianwalter/print')

async function run () {
  let response = await prompt.input('What is your favorite dinosaur?')
  print.success('Response:', response)

  response = await prompt.select('Is it really cold?')
  print.success('Response:', `${response}`)
}

run()
