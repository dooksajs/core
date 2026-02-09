import { createPlugin } from '@dooksa/create-plugin'
import { stateGetValue } from '#core'

const tokenProcess = {}
const tokenValues = {
  heading: {
    default: 'Add title'
  },
  img: {
    default: 'data:image/gif;base64,R0lGODdhAQABAPAAAP8AAAAAACwAAAAAAQABAAACAkQBADs='
  }
}

/**
 * Retrieve a token
 * @param {string} type The expected value to be returned by the token
 * @param {string} viewId An ID related to the content and the target, usually the element ID
 * @param {Object} process Temporary information about the current token being processed
 * @param {number} index The index of the current token within the process
 * @param {string[]} token The token without the brackets, e.g. placeholder:empty
 * @param {number} start The index of the start of the token
 * @param {number} end The index of end of the token
 * @param {Function} updateText This the function that updates the element, for example: element.textContent
 * @returns {number} The length of the value retrieved
 */
function tokenGet (type, viewId, process, index, tokenId, token, start, end, updateText) {
  const item = process.list[index]
  let valueLength = 0

  item.value = this.$token(tokenId, viewId, token)
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

      tokenUpdateText(process, item, value, start, start, updateText)

      item.processed = true
    })

    tokenUpdateText(process, item, '', start, end, updateText)
  } else {
    tokenUpdateText(process, item, item.value, start, end, updateText)

    item.processed = true
    valueLength = item.value.toString().length
  }

  return valueLength
}

function tokenSplice (string, start, end, insert = '') {
  return string.slice(0, start) + insert + string.slice(end)
}

function tokenUpdateText (process, item, insert, start, end, updateText) {
  item.valueLength = insert.toString().length
  process.value = tokenSplice(process.value, start, end, insert)

  updateText(process.value)
}

export const token = createPlugin('token', {
  metadata: {
    title: 'Token',
    description: 'Provides a placeholder variable',
    icon: 'gravity-ui:square-brackets-letter-a'
  },
  tokens: {
    empty () {
      return ''
    },
    placeholder (args) {
      const language = stateGetValue({ name: 'metadata/currentLanguage' })
      const placeholder = tokenValues[args[2]]

      if (placeholder[language.item]) {
        return placeholder[language.item]
      }

      return placeholder.default
    }
  },
  methods: {
    parseText (value) {
      // return empty
      if (value === '[empty]') {
        return {
          value: '',
          token: false
        }
      }

      const pattern = /\[(.+)\]/
      const findToken = new RegExp(pattern, 'g')
      const token = findToken.test(value)

      return {
        value,
        token
      }
    }
  },
  actions: {
    textContent: {
      /**
       * Convert tokens to related string and update the element that the content is attached to
       * @param {Object} param - Parameters object
       * @param {string} param.viewId An ID related to the content and the target, usually the element ID
       * @param {string} param.text The original text that includes the tokens
       * @param {Function} param.updateText This the function that updates the element, e.g. element.textContent
       */
      method ({ viewId, text, updateText }) {
        let tokenIndex = 0
        // create new process if text is different or no process exists
        if (!tokenProcess[viewId] || tokenProcess[viewId].tokens !== text) {
          tokenProcess[viewId] = {
            list: {},
            text,
            tokenised: false,
            tokens: text
          }
        }

        const item = tokenProcess[viewId]

        if (item.tokenised) {
          item.value = text
          let valuePadding = 0

          for (const tokenIndex in item.list) {
            if (Object.hasOwnProperty.call(item.list, tokenIndex)) {
              const token = item.list[tokenIndex]
              const prevLength = token.valueLength

              if (valuePadding) {
                token.start = token.start + valuePadding
                token.end = token.end + valuePadding
              }

              const nextLength = tokenGet(
                'values',
                viewId,
                item,
                tokenIndex,
                token.id,
                token.args,
                token.start,
                token.end,
                updateText
              )

              if (prevLength !== nextLength) {
                valuePadding = nextLength - prevLength
              }
            }
          }

          return
        }

        for (let i = 0; i < item.value.length; i++) {
          const bracketLeft = item.value[i]
          // find open bracket
          if (bracketLeft === '[') {
            let token = ''

            for (let j = i + 1; j < item.value.length; j++) {
              const bracketRight = item.value[j]
              // find closing bracket then process token
              if (bracketRight === ']') {
                let valueLength = 0
                // token found
                if (token.length > 1) {
                  const tokenArgs = token.split(':')
                  const tokenId = tokenArgs[0] + '/' + tokenArgs[1]
                  const end = j + 1

                  item.list[tokenIndex] = {
                    id: tokenId,
                    processed: false,
                    args: tokenArgs,
                    value: '',
                    start: i,
                    end
                  }
                  // get token
                  valueLength = tokenGet(
                    'values',
                    viewId,
                    item,
                    tokenIndex,
                    tokenId,
                    tokenArgs,
                    i,
                    end,
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

        item.tokenised = true
      }
    }
  }
})

export const { tokenTextContent } = token
export default token
