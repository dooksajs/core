import { createComponent, extendComponent } from '@dooksa/create-component'

export const form = createComponent({
  id: 'form',
  tag: 'form',
  initialize (context, emit) {
    const form = document.createElement('form')
    // let dooksa handle the form submit
    form.addEventListener('submit', (e) => {
      e.preventDefault()
      e.stopPropagation()

      emit({
        name: 'form/submit',
        id: context.id,
        context,
        payload: new FormData(form)
      })
    }, false)

    return form
  },
  options: {
    autocapitalize: {
      name: 'autocapitalize',
      values: {
        none: 'none',
        sentences: 'sentences',
        words: 'words',
        characters: 'characters'
      }
    },
    autocomplete: {
      name: 'autocomplete',
      values: {
        on: 'on',
        off: 'off'
      }
    },
    wasValidated: {
      name: 'className',
      value: 'was-validated',
      toggle: true
    },
    name: { name: 'name' },
    rel: {
      name: 'rel',
      values: {
        external: 'external',
        noFollow: 'nofollow',
        opener: 'opener',
        noOpener: 'nonopener',
        noReferrer: 'noreferrer',
        help: 'help',
        prev: 'prev',
        next: 'next',
        search: 'search',
        license: 'license'
      }
    }
  },
  eventTypes: { 'node/submit': true }
})

/**
 * @import {ComponentExtend, ComponentEventOn} from '@dooksa/create-component'
 */

/**
 * @typedef {Object} ExtendFormOption
 * @property {'none'|'sentences'|'words'|'characters'} [autocapitalize] - Controls whether inputted text is automatically capitalized and, if so, in what manner.
 * @property {'on'|'off'} [autocomplete] - Indicates whether input elements can by default have their values automatically completed by the browser.
 * @property {string} [name]
 * @property {'external'|'nofollow'|'opener'|'noOpener'|'noReferrer'|'help'|'prev'|'next'|'search'|'license'} [rel]
 * @property {boolean} [wasValidated] - Indicates the form was validated
 */

/**
 * @typedef {Object} ExtendFormMixin
 * @property {ExtendFormOption} [options]
 */

/**
 * @typedef {Object} ExtendFormEvent
 * @property {'form/submit'
 *   | 'form/valid'
 *   | 'form/invalid'
 *   | ComponentEventOn
 * } on
 * @property {string} actionId
 */

/**
 * @typedef {Object} ExtendFormEventMixin
 * @property {ExtendFormEvent[]} events
 */

/**
 * @typedef {ComponentExtend
 *   &  ExtendFormMixin
 *   | ExtendFormEventMixin
 * } ExtendForm
 */

/**
 * @param {ExtendForm} options
 */
export const createForm = function (options) {
  return extendComponent(form, options)
}
