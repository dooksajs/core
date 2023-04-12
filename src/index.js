export default {
  name: 'dsToken',
  version: 1,
  data: {
    process: {
      private: true,
      default: {}
    },
    values: {
      private: true,
      default: {
        heading: {
          default: 'Add title'
        }
      }
    }
  },
  tokens: {
    empty () {
      return ''
    },
    placeholder (args) {
      const language = this.$getDataValue({ name: 'dsMetadata/language' })
      const heading = this.values[args[2]]

      if (heading[language.value]) {
        return heading[language.value]
      }

      return heading.default
    }
  },
  methods: {
    /**
     * Convert tokens to related string and update the element that the content is attached to
     * @param {string} param.dsViewId An ID related to the content and the target, usually the element ID
     * @param {string} param.text The original text that includes the tokens
     * @param {Function} param.updateText This the function that updates the element, e.g. element.textContent
     */
    textContent ({ dsViewId, text, updateText }) {
      let tokenIndex = 0
      // create new process if text is different or no process exists
      if (!this.process[dsViewId] || this.process[dsViewId].tokens !== text) {
        this.process[dsViewId] = {
          list: {},
          text,
          tokens: text
        }
      }

      const item = this.process[dsViewId]

      for (let i = 0; i < item.text.length; i++) {
        const bracketLeft = item.text[i]
        // find open bracket
        if (bracketLeft === '[') {
          let token = ''

          for (let j = i + 1; j < item.text.length; j++) {
            const bracketRight = item.text[j]
            // find closing bracket then process token
            if (bracketRight === ']') {
              let valueLength = 0
              // token found
              if (token.length > 1) {
                item.list[tokenIndex] = {
                  id: token,
                  processed: false,
                  value: '',
                  start: i
                }
                // get token
                valueLength = this._get(
                  'values',
                  dsViewId,
                  item,
                  tokenIndex,
                  token.split(':'),
                  i,
                  j + 1,
                  updateText
                )
                // increment token process index
                tokenIndex++
              }

              i = i + valueLength

              break
            }

            token += bracketRight
          }
        }
      }
    },
    /**
     * Retrieve a token
     * @param {string} type The expected value to be returned by the token
     * @param {dsViewId} dsViewId An ID related to the content and the target, usually the element ID
     * @param {Object} process Temporary information about the current token being processed
     * @param {number} index The index of the current token within the process
     * @param {string} token The token without the brackets, e.g. placeholder:empty
     * @param {number} start The index of the start of the token
     * @param {number} end The index of end of the token
     * @param {Function} param.updateText This the function that updates the element, for example: element.textContent
     * @returns {number} The length of the value retrieved
     */
    _get (type, dsViewId, process, index, token, start, end, updateText) {
      const item = process.list[index]
      let valueLength = 0

      item.value = this.$token(token[0] + '/' + token[1], token)
      // check if token exists
      if (item.value === undefined) {
        item.value = '[' + token.join(':') + ']'
      }

      if (item.value instanceof Promise) {
        item.value.then(value => {
          // append the length of all the processed tokens to the start point
          for (let i = 0; i < index; i++) {
            const token = process.list[i]

            if (token.processed) {
              start += token.valueLength
            }
          }

          this._updateText(process, item, value, start, start, updateText)

          item.processed = true
        })

        this._updateText(process, item, '', start, end, updateText)
      } else {
        this._updateText(process, item, item.value, start, end, updateText)

        item.processed = true
        valueLength = item.value.toString().length
      }

      return valueLength
    },
    _splice (string, start, end, insert = '') {
      return string.slice(0, start) + insert + string.slice(end)
    },
    _updateText (process, item, insert, start, end, updateText) {
      item.valueLength = insert.toString().length
      process.text = this._splice(process.text, start, end, insert)

      updateText(process.text)
    }
  }
}
