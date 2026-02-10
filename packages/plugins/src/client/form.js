import { createPlugin } from '@dooksa/create-plugin'
import { generateId } from '@dooksa/utils'

/**
 * @import {FormOrderedValue, FormFiles} from '@dooksa/types'
 */

export const form = createPlugin('form', {
  metadata: {
    title: 'Form',
    description: 'Handle form data',
    icon: 'mdi:form'
  },
  methods: {
    /**
     * Attach a file to the FormData object
     * @param {File} value - The file object to attach
     * @param {FormFiles} files - The files object containing FormData
     * @returns {string|undefined} - Returns a unique ID for the file, or undefined if file is empty
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
     * Recursively sort form elements into ordered values, handling fieldsets and file attachments
     * @param {HTMLCollection|HTMLFormControlsCollection} children - Collection of form elements to process
     * @param {HTMLFormControlsCollection} elements - All form elements collection for lookup
     * @param {FormData} data - FormData object containing form values
     * @param {Object} [process={used: {}, disabled: false }] - Processing state to track used elements and disabled status
     * @param {Object.<string, Element>} process.used - Object tracking already processed element names
     * @param {boolean} process.disabled - Flag indicating if current fieldset is disabled
     * @param {FormOrderedValue[]} [values=[]] - Accumulator for ordered form values
     * @param {Object} [files={}] - Object to store file attachments
     * @param {FormData} [files.data] - FormData for file storage
     * @param {boolean} [isHead=true] - Flag indicating if this is the top-level call
     * @returns {Object|undefined} - Returns object with values and files (if files present), or undefined for nested calls
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
     * Sort FormData into values and files (unordered)
     * @param {FormData} data - FormData object containing form values and files
     * @returns {Object} - Object containing values and files properties with the structure:
     * { values: Object.<string, string>, files: FormData } or { values: Object.<string, string> }
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
        description: 'Format form data into ordered or unordered structure with file support',
        icon: 'mdi:form-select'
      },
      /**
       * Format form data into ordered or unordered structure
       * @param {Object} form - Form data object
       * @param {HTMLFormControlsCollection} form.elements - Collection of form elements
       * @param {FormData} form.data - FormData object containing form values
       * @param {'ordered'|'unordered'} form.sort - Sorting method: 'ordered' preserves fieldset structure, 'unordered' creates flat object
       * @returns {Object} - Formatted form data with values and optional files
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
