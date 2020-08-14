#!/usr/bin/env node

const { promises: fs } = require('fs')
const execa = require('execa')
const generatesCommit = require('.')

const options = { stdio: 'inherit' }

async function run () {
  //
  await fs.writeFile('test.txt', 'Hello!')

  //
  const { results } = await generatesCommit.generate({
    dryRun: true,
    data: {
      commit: {
        files: ['test.txt'],
        push: false
      }
    }
  })
  console.log('Results:', results)

  //
  await execa('git', ['log', '-1'], options)

  //
  await execa('git', ['reset', 'HEAD~1', '--soft'], options)
  await execa('git', ['reset', 'test.txt'], options)
  await execa('git', ['checkout', 'test.txt'], options)
}

run().catch(console.error)
