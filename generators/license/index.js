import generates from '@generates/core'

function noOp () {}

const licenses = {
  Unlicensed: { spdx: 'UNLICENSED', file: false },
  Custom: { spdx: 'SEE LICENSE IN LICENSE', file: false },
  Hippocratic: { spdx: 'Hippocratic-2.1' },
  AGPL: { spdx: 'AGPL-3.0' },
  ISC: {},
  MIT: {}
}

const ctx = {
  data: {
    currentYear: new Date().getFullYear(),
    licensor: {
      get description () {
        return [
          ctx.data.licensor.name && ` ${ctx.data.licensor.name}`,
          ctx.data.licensor.email && ` <${ctx.data.licensor.email}>`,
          ctx.data.licensor.url && ` (${ctx.data.licensor.url})`
        ].join('')
      }
    },
    license: {
      get spdx () {
        const { name } = ctx.data.license.name
        return licenses[name]?.spdx || name
      }
    }
  },
  prompts: {
    'license.name': {
      type: 'select',
      label: 'Which license will the project use?',
      settings: {
        options: Object.keys(licenses)
        // FIXME:
        // get highlighted () {
        //   return generates.getTopAnswer('license.name') || 'Unlicensed'
        // }
      }
    },
    'project.name': {
      label: 'What is the name of this project?',
      get required () {
        const { name } = ctx.data.license
        return name === 'AGPL' || name === 'Hippocratic'
      }
    },
    'project.description': {
      label: "What is this project's description?",
      get required () {
        return ctx.data.license.name === 'AGPL'
      }
    },
    'licensor.name': {
      label: "What is the name of this project's author?",
      get required () {
        return ctx.data.license.name !== 'Unlicensed'
      }
    },
    'licensor.email': {
      label: "What is this project's author's email address?",
      get required () {
        return ctx.data.license.name !== 'Unlicensed'
      }
    },
    'licensor.url': {
      label: "What is this project's author's website URL?",
      get required () {
        return ctx.data.license.name !== 'Unlicensed'
      }
    }
  },
  files: {
    license: {
      filename: 'LICENSE',
      get render () {
        const { name } = ctx.data.license
        const hasFile = licenses[name]?.file !== false
        const log = ctx.logger.ns('generates.license')
        log.debug(`License file for ${name}:`, hasFile)
        return hasFile ? require(`./templates/${name}.js`) : noOp
      }
    }
  }
}

module.exports = generates.createGenerator(ctx)
