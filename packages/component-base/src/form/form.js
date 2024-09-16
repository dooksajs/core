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
    name: {
      name: 'name'
    },
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
  events: [
    {
      on: 'component/mount',
      actionId: 'form-no'
    }
  ]
})


/**
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 */

/**
 * @typedef {Object} ComponentExtendFormOptions
 * @property {'none'|'sentences'|'words'|'characters'} [autocapitalize] - Controls whether inputted text is automatically capitalized and, if so, in what manner.
 * @property {'on'|'off'} [autocomplete] - Indicates whether input elements can by default have their values automatically completed by the browser.
 * @property {string} [name]
 * @property {'external'|'nofollow'|'opener'|'noOpener'|'noReferrer'|'help'|'prev'|'next'|'search'|'license'} [rel]
 * @property {boolean} [wasValidated] - Indicates the form was validated
 */

/**
 * @typedef {Object} ComponentExtendForm
 * @property {ComponentExtendFormOptions} options
 */

/**
 * @param {ComponentExtend|ComponentExtendForm} options
 */
export const extendForm = function (options) {
  return extendComponent(form, options)
}