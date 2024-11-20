import { createMixin } from '@dooksa/create-component'

/**
 * @typedef {Object} ContenteditableMixin
 * @property {'true'|'false'|'plainText'} [contenteditable] - {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/contenteditable}
 */

export default createMixin({
  metadata: {
    id: 'contenteditable'
  },
  data: {
    options: {
      contenteditable: {
        name: 'contenteditable',
        values: {
          true: 'true',
          false: 'false',
          plainText: 'plaintext-only'
        }
      }
    }
  }
})

