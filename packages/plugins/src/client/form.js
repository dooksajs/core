import { createPlugin } from '@dooksa/create-plugin'
import { generateId } from '@dooksa/utils'

/**
 * @typedef {Object} FormOrderedValue - Ordered form values
 * @property {string} name
 * @property {string} [value]
 * @property {FormOrderedValue[]} [values]
 */

/**
 * @typedef {Object} FormFiles - FormData of files
 * @property {FormData} [files.data]
 */

export const form = createPlugin('form', {
  metadata: {
    title: 'Form',
    description: 'Handle form data',
    icon: 'mdi:form'
  },
  methods: {
    /**
     * Attach File to FormData
     * @param {File} value
     * @param {FormFiles} files
     * @returns {string}
     */
    attachFile (value, files) {
      // skip empty files
      if (!value.size) {
        return
      }

      if (!files.data) {
        files.data = new FormData()
      }

      // create unique id for file
      const id = generateId()
      // set file
      files.data.set(id, value)

      return id
    },
    /**
     * @param {HTMLCollection|HTMLFormControlsCollection} children
     * @param {HTMLFormControlsCollection} elements
     * @param {FormData} data - FormData from form
     * @param {Object} [process={used: {}, disabled: false }]
     * @param {Object.<string, Element>} process.used - Avoid processing duplicated elements
     * @param {boolean} process.disabled - Ignore all child inputs under a disabled fieldset
     * @param {FormOrderedValue[]} [values] - Ordered form values
     * @param {Object} [files] - List of files
     * @param {FormData} [files.data]
     * @param {boolean} [isHead=true]
     */
    sortOrdered (
      children,
      elements,
      data,
      process = {
        used: {},
        disabled: false
      },
      values = [],
      files = {},
      isHead = true
    ) {
      for (let i = 0; i < children.length; i++) {
        const element = children[i]
        const name = element.getAttribute('name')
        const input = elements[name]
        const isFieldset = element instanceof HTMLFieldSetElement

        if (!name || // not form element
          (!isFieldset && input.disabled) || // input is disabled
          process.used[name]) { // input already set
          continue
        }

        // set input as used
        if (process.disabled) {
          process.used[name] = input
          continue
        }

        /** @type {FormOrderedValue} */
        const result = {
          name
        }

        // mark element as used
        process.used[name] = element

        if (isFieldset) {
          process.disabled = !!element.disabled

          if (!process.disabled) {
            result.values = []
            // add value
            values.push(result)
          }

          // process fieldset elements
          this.sortOrdered(element.children, elements, data, process, result.values, files)

          // reset disabled to process other fieldset
          process.disabled = false
        } else if (input && input.name === name) {
          const inputValue = data.get(name)

          if (inputValue instanceof File) {
            const fileId = this.attachFile(inputValue, files)

            // skip empty files
            if (!fileId) {
              continue
            }

            // create unique id for file
            result.value = fileId
          } else {
            // add value to result
            result.value = inputValue
          }

          // store result
          values.push(result)

        }
      }

      if (isHead) {
        // return files and values
        if (files.data) {
          return {
            values,
            files
          }
        }

        return { values }
      }
    },
    /**
     * Sort FormData
     * @param {FormData} data
     */
    sortUnordered (data) {
      const result = {
        values: {},
        files: {}
      }

      for (const [name, value] of data.entries()) {
        if (value instanceof File) {
          const fileId = this.attachFile(value, result.files)

          // skip empty files
          if (!fileId) {
            continue
          }

          // create unique id for file
          result[name] = fileId
        } else if (value !== ''){
          result[name] = value
        }
      }

      if (result.files.data) {
        return {
          files: result.files.data,
          values: result.values
        }
      }

      return { values: result.values }
    }
  },
  actions: {
    format: {
      metadata: {
        title: 'Format form',
        description: '',
        icon: ''
      },
      /**
       * @param {object} form
       * @param {HTMLFormControlsCollection} form.elements
       * @param {FormData} form.data
       * @param {'ordered'|'unordered'} form.sort
       */
      method ({ elements, data, sort }) {
        if (!(elements instanceof HTMLFormControlsCollection)) {
          throw new Error('Elements expected type of HTMLFormControlsCollection')
        }

        if (!(data instanceof FormData)) {
          throw new Error('Form expected type of FormData')
        }

        if (sort === 'ordered') {
          return this.sortOrdered(elements, elements, data)
        }

        return this.sortUnordered(data)
      }
    }
  }
})

export const {
  formAttachFile,
  formFormat,
  formSortOrdered,
  formSortUnordered
} = form


export default form
