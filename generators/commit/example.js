#!/usr/bin/env node

import { promises as fs } from 'fs'
import execa from 'execa'
import generatesCommit from './index.js'

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
