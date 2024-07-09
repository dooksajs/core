import createPlugin from '@dooksa/create-plugin'
import { dataGetValue, dataAddListener } from '../data.js'
import Modal from 'bootstrap/js/src/modal.js'
import { componentRemove } from '../component.js'

/** @type {Object.<string, Modal>} */
const modalItems = {}

const bootstrapModal = createPlugin('bootstrapModal', {
  actions: {
    /**
     * Create Modal
     * @param {Object} param
     * @param {string} param.id - View id used to fetch the element.
     * @param {Object} [param.options] - Modal options
     * @param {boolean|'static'} [param.options.backdrop=true] - Includes a modal-backdrop element. Alternatively, specify static for a backdrop which doesn’t close the modal when clicked.
     * @param {boolean} [param.options.focus=true] - Puts the focus on the modal when initialised.
     * @param {boolean} [param.options.keyboard=true] - Closes the modal when escape key is pressed.
     */
    create ({
      id,
      options = {
        backdrop: true,
        focus: true,
        keyboard: true
      }
    }) {
      // fetch existing modal
      let modal = modalItems[id]

      if (modal instanceof Modal) {
        return
      }

      const node = dataGetValue({ name: 'component/nodes', id })

      // create new modal
      modal = new Modal(node.item, options)

      modalItems[id] = modal

      node.item.addEventListener('hidden.bs.modal', () => {
        componentRemove({ id })
      })

      // clean up modal
      dataAddListener({
        name: 'component/nodes',
        on: 'delete',
        id,
        handler: () => {
          delete modalItems[id]
        }
      })

      return modal
    },
    /**
     * Show modal
     * @param {Object} param
     * @param {string} param.id - View id that the modal belongs to
     */
    show ({ id }) {
      const modal = modalItems[id]

      if (!(modal instanceof Modal)) {
        throw new Error('No modal found: ' + id)
      }

      modal.show()
    }
  }
})

const bootstrapModalShow = bootstrapModal.actions.show
const bootstrapModalCreate = bootstrapModal.actions.create

export {
  bootstrapModalCreate,
  bootstrapModalShow
}

export default bootstrapModal
