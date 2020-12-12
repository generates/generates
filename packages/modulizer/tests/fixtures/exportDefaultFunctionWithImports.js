import npmShortName from '@ianwalter/npm-short-name'
import ky from 'ky'
import url from './exportDefaultLiteral'

export default function greeting () {
  return ky.get(npmShortName(url))
}
