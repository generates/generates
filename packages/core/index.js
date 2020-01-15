const merge = require('@ianwalter/merge')
const { stripIndent } = require('common-tags')

module.exports = class Generator {
  constructor (...data) {
    this.data = merge({ files: {}, questions: {}, answers: {} }, ...data)
  }

  async generate () {
    const questions = Object.values(this.data.questions)

    const context = {
      ...this.data,
      stripIndent,
      makeLine (...items) {
        return items.join('')
      },
      getAnswer (key, format) {
        const answer = this.answers[key]
        return format ? format(answer) : answer
      },
      addNextQuestions (nextQuestions) {

      }
    }

    for (const question of questions) {
      if (question.after) {
        question.after(context)
      }
    }

    return Object.values(context.files).reduce(
      (acc, file) => (acc[file.filename] = file.template(context) && acc),
      {}
    )
  }
}
