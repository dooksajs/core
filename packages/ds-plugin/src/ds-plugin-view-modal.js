import { definePlugin } from '@dooksa/ds-scripts'
import Modal from 'bootstrap/js/src/modal.js'

export default definePlugin({
  name: 'dsViewModal',
  version: 1,
  data: {
    items: {
      schema: {
        type: 'collection',
        items: {
          type: 'function'
        }
      }
    }
  },
  methods: {
    /**
     * Create Modal
     * @param {Object} param
     * @param {string} param.dsViewId - View id used to fetch the element.
     * @param {Object} [param.options] - Modal options
     * @param {boolean|'static'} [param.options.backdrop=true] - Includes a modal-backdrop element. Alternatively, specify static for a backdrop which doesn’t close the modal when clicked.
     * @param {boolean} [param.options.focus=true] - Puts the focus on the modal when initialised.
     * @param {boolean} [param.options.keyboard=true] - Closes the modal when escape key is pressed.
     */
    create ({
      dsViewId,
      options = {
        backdrop: true,
        focus: true,
        keyboard: true
      }
    }) {
      // fetch existing modal
      let modal = this.$getDataValue('dsViewModal/items', {
        id: dsViewId
      })

      if (!modal.isEmpty) {
        return
      }

      const view = this.$getDataValue('dsView/items', {
        id: dsViewId
      })

      // create new modal
      modal = new Modal(view.item, options)

      this.$setDataValue('dsViewModal/items', modal, { id: dsViewId })

      // clean up modal
      this.$addDataListener('dsView/items', {
        on: 'delete',
        id: dsViewId,
        handler: () => {
          this.$deleteDataValue('dsViewModal/items', dsViewId)
        }
      })
    }
  }
})
