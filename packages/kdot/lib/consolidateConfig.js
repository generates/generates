import { merge } from '@generates/merger'

export default async function consolidateConfig (input) {
  const { default: base } = await import(input.base)

  let custom
  try {
    const mod = await import(input.custom)
    custom = mod.default
  } catch (_) {}

  return merge({}, base, custom, input.ext)
}
