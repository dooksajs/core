import { definePlugin } from '@dooksa/ds-scripts'
import Modal from 'bootstrap/js/src/modal.js'

export default definePlugin({
  name: 'dsViewModal',
  version: 1,
  data: {
    items: {
      private: true,
      schema: {
        type: 'collection',
        items: {
          type: 'object'
        }
      }
    }
  },
  methods: {
    /**
     * Create Modal
     * @param {Object} param
     * @param {string} param.dsViewId - View id used to fetch the element.
     * @param {string} param.dsWidgetId - Widget id the view element belongs to.
     * @param {Object} [param.options] - Modal options
     * @param {boolean|'static'} [param.options.backdrop=true] - Includes a modal-backdrop element. Alternatively, specify static for a backdrop which doesn’t close the modal when clicked.
     * @param {boolean} [param.options.focus=true] - Puts the focus on the modal when initialised.
     * @param {boolean} [param.options.keyboard=true] - Closes the modal when escape key is pressed.
     */
    create ({
      dsViewId,
      dsWidgetId,
      options = {
        backdrop: true,
        focus: true,
        keyboard: true
      }
    }) {
      // fetch existing modal
      let modal = this.items[dsViewId]

      if (modal instanceof Modal) {
        return
      }

      const view = this.$getDataValue('dsView/items', {
        id: dsViewId
      })

      // create new modal
      modal = new Modal(view.item, options)

      this.items[dsViewId] = modal

      view.item.addEventListener('hidden.bs.modal', () => {
        const attachedSection = this.$getDataValue('dsWidget/attached', {
          id: dsWidgetId
        })

        if (!attachedSection.isEmpty) {
          const section = this.$getDataValue('dsSection/items', {
            id: attachedSection.item,
            options: {
              clone: true
            }
          })
          const items = section.item

          for (let i = 0; i < items.length; i++) {
            const id = items[i]

            if (id === dsWidgetId) {
              items.splice(i, 1)
              break
            }
          }

          this.$setDataValue('dsSection/items', items, { id: section.id })
        }
      })

      // clean up modal
      this.$addDataListener('dsView/items', {
        on: 'delete',
        id: dsViewId,
        handler: () => {
          delete this.items[dsViewId]
        }
      })

      return modal
    },
    /**
     * Show modal
     * @param {Object} param
     * @param {string} param.dsViewId - View id that the modal belongs to
     */
    show ({ dsViewId }) {
      const modal = this.items[dsViewId]

      if (!(modal instanceof Modal)) {
        return this.$log('warn', { message: 'No modal found: ' + dsViewId })
      }

      modal.show()
    }
  }
})
