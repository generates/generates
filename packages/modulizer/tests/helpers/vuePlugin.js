import VuePlugin from 'rollup-plugin-vue'

export default [
  VuePlugin({ styleToImports: true, template: { isProduction: true } })
]
