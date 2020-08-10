const merge = require('@ianwalter/merge')
const { stripIndent } = require('common-tags')
const prompt = require('@generates/prompt')

function createGenerator (ctx) {
  return {
    async generate (data = {}) {
      //
      ctx.data = merge({}, ctx.data, data)

      //
      for (const [key, question] of Object.entries(ctx.questions)) {
        if (ctx.data[key] === undefined && question.required !== false) {
          //
          const type = question.type || 'text'

          //
          ctx.data[key] = await prompt[type](
            question.question,
            question.settings
          )
          console.log(key, ctx.data[key])
        }
      }

      //
      ctx.stripIndent = stripIndent
      ctx.makeLine = function makeLine (...items) {
        return items.join('')
      }

      //
      console.log('config', ctx)
      return Object.entries(ctx.files).reduce(
        (acc, [key, file]) => {
          try {
            console.log('file', file.template(ctx))
          } catch (err) {
            console.error(err)
          }
          acc[file.filename || key] = file.template(ctx)
          return acc
        },
        {}
      )
    }
  }
}

module.exports = { createGenerator }

// module.exports = class Generator {
//   constructor (...data) {
//     this.data = merge({ files: {}, questions: {}, answers: {} }, ...data)
//   }

//   async generate () {
//     const questions = Object.values(this.data.questions)

//     const context = {
//       ...this.data,
//       stripIndent,
//       makeLine (...items) {
//         return items.join('')
//       },
//       getAnswer (key, format) {
//         const answer = this.answers[key]
//         return format ? format(answer) : answer
//       },
//       addNextQuestions (nextQuestions) {

//       }
//     }

//     for (const question of questions) {
//       if (question.after) {
//         question.after(context)
//       }
//     }

//     return Object.values(context.files).reduce(
//       (acc, file) => (acc[file.filename] = file.template(context)) && acc,
//       {}
//     )
//   }
// }
