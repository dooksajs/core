import { name, version } from '../ds.plugin.config'

export default {
  name,
  version,
  data: {
    tokens: {
      arg: true
    }
  },
  methods: {
    _arg (token, rules) {
      const index = token.name
      const rule = rules[index]

      if (rule) {
        let result = this.$context.method('dsWorkflow/rules', rule)

        if (result) {
          result = result[0]
        }

        return result
      }
    },
    _get (token, rules) {
      return this['_' + token.type](token, rules)
    },
    create (string) {
      const tokens = []
      let token = {}
      let tokenName = ''
      let found = false
      let newString = ''
      let offset = 0

      for (let i = 0; i < string.length; i++) {
        const char = string[i]

        if (char === '[') {
          found = true

          if (token.name) {
            offset = offset + token.name.length + 2
          }

          token = {}
          token.pos = i
        } else if (char === ']') {
          found = false

          if (offset) {
            token.pos = token.pos - offset
          }

          const args = tokenName.split(':')
          token.type = args[0]
          token.name = args[1]
          token.args = args.slice(2)
          tokens.push(token)
          tokenName = ''
        } else if (found) {
          tokenName += char
        } else {
          newString += char
        }
      }

      return { string: newString, tokens }
    },
    add (tokens) {
      this.tokens = { ...this.tokens, ...tokens }
    },
    replace ({ data = { tokens: [] }, rules }) {
      let newString = data.string
      let offset = 0

      for (let i = 0; i < data.tokens.length; i++) {
        const token = data.tokens[i]
        let result

        if (this.tokens[token.type]) {
          result = this._get(token, rules)
        }

        if (result) {
          const pos = token.pos + offset
          result = result.toString()

          newString = newString.substr(0, pos) + result + newString.substr(pos)
          offset += result.length
        }
      }

      return newString
    }
  }
}
