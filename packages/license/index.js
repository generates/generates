const generates = require('@generates/core')

function noOp () {}

const config = {
  data: {
    year: new Date().getFullYear(),
    get license () {
      console.log('config.data.licenseName', this.licenseName)
      switch (config.data.licenseName) {
        case 'AGPLv3': return require('./templates/AGPLv3')
        case 'ISC': return require('./templates/ISC')
        default: return noOp
      }
    }
  },
  questions: {
    licenseName: {
      type: 'select',
      question: 'Which license will the project use?',
      settings: {
        options: [
          'UNLICENSED',
          'SEE LICENSE IN LICENSE',
          'AGPLv3',
          'ISC'
        ],
        get highlighted () {
          // TODO:
          // const name = generates.getTopAnswer('licenseName') || 'UNLICENSED'
          const name = 'UNLICENSED'
          return config.questions.licenseName.settings.options.indexOf(name)
        }
      }
    },
    projectName: {
      question: 'What is the name of this project?',
      get required () {
        return config.data.licenseName === 'AGPLv3'
      }
    },
    projectDescription: {
      question: "What is this project's description?",
      get required () {
        return config.data.licenseName === 'AGPLv3'
      }
    },
    authorName: {
      question: "What is the name of this project's author?",
      get required () {
        return config.data.licenseName !== 'UNLICENSED'
      }
    },
    authorEmail: {
      question: "What is this project's author's email address?",
      get required () {
        return config.data.licenseName !== 'UNLICENSED'
      }
    },
    authorUrl: {
      question: "What is this project's author's website URL?",
      get required () {
        return config.data.licenseName !== 'UNLICENSED'
      }
    }
  },
  files: {
    license: {
      filename: 'LICENSE',
      get template () {
        return config.data.license
      }
    }
  }
}

module.exports = generates.createGenerator(config)
