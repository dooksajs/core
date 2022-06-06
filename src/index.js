/**
 * Dooksa component tools.
 * @module plugin
 */
export default {
  name: 'dsComponent',
  version: 1,
  data: {
    items: {},
    tags: {
      dsA: {
        is: 'ds-a',
        tag: 'a',
        type: 'Element'
      },
      dsDiv: {
        is: 'ds-div',
        tag: 'div',
        type: 'Element'
      },
      dsH1: {
        is: 'ds-h1',
        tag: 'h1',
        type: 'Element'
      },
      dsH2: {
        is: 'ds-h2',
        tag: 'h2',
        type: 'Element'
      },
      dsH3: {
        is: 'ds-h3',
        tag: 'h3',
        type: 'Element'
      },
      dsH4: {
        is: 'ds-h4',
        tag: 'h4',
        type: 'Element'
      },
      dsH5: {
        is: 'ds-h5',
        tag: 'h5',
        type: 'Element'
      },
      dsH6: {
        is: 'ds-h6',
        tag: 'h6',
        type: 'Element'
      },
      dsHR: {
        is: 'ds-hr',
        tag: 'hr',
        type: 'Element'
      },
      dsP: {
        is: 'ds-p',
        tag: 'p',
        type: 'Element'
      },
      dsI: {
        is: 'ds-i',
        tag: 'i',
        type: 'Element'
      },
      dsSpan: {
        is: 'ds-span',
        tag: 'span',
        type: 'Element'
      },
      dsButton: {
        is: 'ds-button',
        tag: 'button',
        type: 'Element'
      },
      dsImg: {
        is: 'ds-image',
        tag: 'img',
        type: 'Element'
      },
      dsLabel: {
        is: 'ds-label',
        tag: 'label',
        type: 'Element'
      },
      dsInput: {
        is: 'ds-input',
        tag: 'input',
        type: 'Element'
      },
      dsTextarea: {
        is: 'ds-textarea',
        tag: 'textarea',
        type: 'Element'
      },
      dsUl: {
        is: 'ds-ul',
        tag: 'ul',
        type: 'Element'
      },
      dsLi: {
        is: 'ds-li',
        tag: 'li',
        type: 'Element'
      },
      dsOl: {
        is: 'ds-ol',
        tag: 'ol',
        type: 'Element'
      },
      dsNav: {
        is: 'ds-nav',
        tag: 'nav',
        type: 'Element'
      },
      dsText: {
        type: 'Node'
      }
    }
  },
  setup () {
    const DsElementMixin = (base) => (
      class DsElementMixin extends base {
        constructor () {
          super()
          this.dsElementId = ''
          // change this to method since we are only using core plugins
          this.$dsMethod = () => {}
        }

        connectedCallback () {
          this.$dsMethod('dsEvent/emit', {
            id: this.dsElementId,
            name: 'mounted',
            payload: this.dsElementId
          })
        }

        disconnectedCallback () {
          this.$dsMethod('dsEvent/emit', {
            id: this.dsElementId,
            name: 'unmounted',
            payload: this.dsElementId
          })
        }

        dsAttributes (attributes) {
          // Add attributes to element
          for (const key in attributes) {
            if (Object.prototype.hasOwnProperty.call(attributes, key)) {
              // check if setter exists on element
              if (this.__lookupSetter__(key)) {
                this[key] = attributes[key]
              }
            }
          }
        }
      }
    )

    const DsElementContentText = (base) => (
      class DsElementContentHTML extends base {
        get dsValue () {
          return this.textContent
        }

        set dsValue (value) {
          this.textContent = value
        }
      }
    )

    const DsElementContentHTML = (base) => (
      class DsElementContentHTML extends base {
        get dsValue () {
          return this.innerHTML
        }

        set dsValue (value) {
          this.innerHTML = value
        }
      }
    )

    class DsImageElement extends DsElementMixin(window.HTMLImageElement) {
      constructor () {
        super()
        // Keeping the element valid
        this.alt = ''
      }

      get dsValue () {
        return this.src
      }

      set dsValue (value) {
        this.src = value
      }
    }

    class DsAnchorElement extends DsElementMixin(window.HTMLAnchorElement) {
      constructor () {
        super()

        this.addEventListener('click', this._click.bind(this))
      }

      get dsValue () {
        return this.href
      }

      set dsValue (value) {
        this.href = value
      }

      _click (event) {
        if (
          event.button === 0 && // Ignore everything but left clicks
          event.target.target !== '_self' && // Let browser handle "target=_blank" etc.
          !this._isModifiedEvent(event) // Ignore clicks with modifier keys
        ) {
          event.preventDefault()

          this.$dsMethod('dsRouter/navigate', event.target.pathname)
        }

        this.$dsMethod('dsEvent/emit', {
          id: this.dsElementId,
          name: 'click'
        })
      }

      _isModifiedEvent (event) {
        return !!(event.getModifierState('Alt') ||
          event.getModifierState('Control') ||
          event.getModifierState('Meta') ||
          event.getModifierState('Shift'))
      }
    }

    class DsButtonElement extends DsElementContentHTML(DsElementMixin(window.HTMLButtonElement)) {
      constructor () {
        super()

        this.addEventListener('click', (e) => {
          this.$dsMethod('dsEvent/emit', {
            id: this.dsElementId,
            name: 'click'
          })
        })
      }
    }

    class DsInputElement extends DsElementMixin(window.HTMLInputElement) {
      constructor () {
        super()

        this.addEventListener('input', (e) => {
          this.$dsMethod('dsElement/updateElementValue', {
            elementId: this.dsElementId,
            contentId: this.contentId,
            value: e.target.value
          })

          this.$dsMethod('dsEvent/emit', {
            id: this.dsElementId,
            name: 'input',
            payload: e.target.value
          })
        })

        this.addEventListener('change', (e) => {
          this.$dsMethod('dsEvent/emit', {
            id: this.dsElementId,
            name: 'change',
            payload: e.target.value
          })
        })
      }

      get dsValue () {
        return this.value
      }

      set dsValue (value) {
        this.value = value
      }
    }

    class DsTextAreaElement extends DsElementContentText(DsElementMixin(window.HTMLTextAreaElement)) {
      constructor () {
        super()

        this.addEventListener('input', (e) => {
          this.$dsMethod('dsElement/updateElementValue', {
            elementId: this.dsElementId,
            contentId: this.contentId,
            value: e.target.value
          })

          this.$dsMethod('dsEvent/emit', {
            id: this.dsElementId,
            name: 'input',
            payload: e.target.value
          })
        })
      }
    }

    class DsIconElement extends DsElementMixin(window.HTMLElement) {
      get dsValue () {
        const value = []

        for (let i = 0; i < this.classList.length; i++) {
          const iconPrefix = this.classList[i][0] + this.classList[i][1] + this.classList[i][2]

          if (iconPrefix === 'dsi') {
            value.push(this.classList[i])
          }
        }

        return value
      }

      set dsValue (values) {
        for (let i = 0; i < values.length; i++) {
          this.classList.add(values[i])
        }
      }
    }

    class DsDivElement extends DsElementContentHTML(DsElementMixin(window.HTMLDivElement)) {}
    class DsOListElement extends DsElementContentHTML(DsElementMixin(window.HTMLOListElement)) {}
    class DsULElement extends DsElementContentHTML(DsElementMixin(window.HTMLUListElement)) {}
    class DsLIElement extends DsElementContentHTML(DsElementMixin(window.HTMLLIElement)) {}
    class DsNavElement extends DsElementContentHTML(DsElementMixin(window.HTMLElement)) {}
    class DsSpanElement extends DsElementContentHTML(DsElementMixin(window.HTMLSpanElement)) {}
    class DsEMElement extends DsElementContentHTML(DsElementMixin(window.HTMLSpanElement)) {}
    class DsParagraphElement extends DsElementContentHTML(DsElementMixin(window.HTMLParagraphElement)) {}
    class DsH1Element extends DsElementContentHTML(DsElementMixin(window.HTMLHeadingElement)) {}
    class DsH2Element extends DsElementContentHTML(DsElementMixin(window.HTMLHeadingElement)) {}
    class DsH3Element extends DsElementContentHTML(DsElementMixin(window.HTMLHeadingElement)) {}
    class DsH4Element extends DsElementContentHTML(DsElementMixin(window.HTMLHeadingElement)) {}
    class DsH5Element extends DsElementContentHTML(DsElementMixin(window.HTMLHeadingElement)) {}
    class DsH6Element extends DsElementContentHTML(DsElementMixin(window.HTMLHeadingElement)) {}
    class DsLabelElement extends DsElementContentHTML(DsElementMixin(window.HTMLLabelElement)) {}
    class DsHRElement extends DsElementMixin(window.HTMLHRElement) {}
    class DsText extends DsElementContentText(window.Text) {}

    // ISSUE: [DS-652] append DsText to dsApp.components
    window.DsText = DsText
    window.customElements.define('ds-nav', DsNavElement, { extends: 'nav' })
    window.customElements.define('ds-ul', DsULElement, { extends: 'ul' })
    window.customElements.define('ds-ol', DsOListElement, { extends: 'ol' })
    window.customElements.define('ds-li', DsLIElement, { extends: 'li' })
    window.customElements.define('ds-a', DsAnchorElement, { extends: 'a' })
    window.customElements.define('ds-i', DsIconElement, { extends: 'i' })
    window.customElements.define('ds-em', DsEMElement, { extends: 'em' })
    window.customElements.define('ds-span', DsSpanElement, { extends: 'span' })
    window.customElements.define('ds-hr', DsHRElement, { extends: 'hr' })
    window.customElements.define('ds-image', DsImageElement, { extends: 'img' })
    window.customElements.define('ds-h1', DsH1Element, { extends: 'h1' })
    window.customElements.define('ds-h2', DsH2Element, { extends: 'h2' })
    window.customElements.define('ds-h3', DsH3Element, { extends: 'h3' })
    window.customElements.define('ds-h4', DsH4Element, { extends: 'h4' })
    window.customElements.define('ds-h5', DsH5Element, { extends: 'h5' })
    window.customElements.define('ds-h6', DsH6Element, { extends: 'h6' })
    window.customElements.define('ds-p', DsParagraphElement, { extends: 'p' })
    window.customElements.define('ds-div', DsDivElement, { extends: 'div' })
    window.customElements.define('ds-button', DsButtonElement, { extends: 'button' })
    window.customElements.define('ds-input', DsInputElement, { extends: 'input' })
    window.customElements.define('ds-label', DsLabelElement, { extends: 'label' })
    window.customElements.define('ds-textarea', DsTextAreaElement, { extends: 'textarea' })
  },
  methods: {
    getItem (context, { id, modifierId }) {
      const [tag, attributes] = this._getItem(modifierId || id)
      const item = this._getTag(tag)

      if (attributes) {
        item.attributes = attributes
      }

      return item
    },
    set (context, item) {
      this.items = Object.assign(item, this.items)
    },
    _getItem (id) {
      return this.items[id]
    },
    _getTag (id) {
      return { ...this.tags[id] }
    }
  }
}
