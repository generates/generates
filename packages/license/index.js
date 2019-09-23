const Generator = require('@generates/core')

module.exports = class GeneratesLicense extends Generator {
  constructor (data) {
    super(
      {
        files: {
          license: {
            filename: 'LICENSE',
            template (context) {
              const code = 'context => `' + context.answers.licenseBody + '\n`'
              return eval(code)(context)
            }
          }
        },
        templates: {
          AGPLv3: require('./templates/AGPLv3'),
          ISC: require('./templates/ISC')
        },
        answers: {
          year: new Date().getFullYear()
        },
        questions: {
          license: {
            type: 'select',
            text: 'Which license will the project use?',
            choices: [
              'UNLICENSED',
              'SEE LICENSE IN LICENSE',
              'AGPLv3',
              'ISC'
            ],
            default (context) {
              return context.getTopAnswer('license') || 'UNLICENSED'
            },
            after (context) {
              const answer = context.getAnswer('license')
              if (answer === 'UNLICENSED') {
                delete context.files.license
              } else if (answer === 'SEE LICENSE IN LICENSE') {
                context.addNextQuestions({
                  licenseName: { text: 'What is the name of the license?' },
                  licenseTemplate: { text: 'Add your license template:' }
                })
              } else {
                context.answers.licenseName = answer
                context.files.license.template = context.templates[answer]
              }
            }
          },
          projectName: {
            necessary (context) {
              return context.answers.license === 'AGPLv3'
            },
            text: 'What is the name of this project?'
          },
          projectDescription: {
            necessary (context) {
              return context.answers.license === 'AGPLv3'
            },
            text: "What is this project's description?"
          },
          authorName: {
            necessary (context) {
              return context.answers.license !== 'UNLICENSED'
            },
            text: "What is the name of this project's author?"
          },
          authorEmail: {
            necessary (context) {
              return context.answers.license !== 'UNLICENSED'
            },
            text: "What is this project's author's email address?"
          },
          authorUrl: {
            necessary (context) {
              return context.answers.license !== 'UNLICENSED'
            },
            text: "What is this project's author's website URL?"
          }
        }
      },
      data
    )
  }
}
