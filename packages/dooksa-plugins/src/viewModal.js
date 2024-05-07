import { createPlugin } from '@dooksa/create'
import Modal from 'bootstrap/js/src/modal.js'

const viewModal = createPlugin('viewModal', ({ defineActions }, { $getDataValue, $setDataValue, $addDataListener }) => {
  const modalItems = {}

  defineActions({
    /**
     * Create Modal
     * @param {Object} param
     * @param {string} param.viewId - View id used to fetch the element.
     * @param {string} param.widgetId - Widget id the view element belongs to.
     * @param {Object} [param.options] - Modal options
     * @param {boolean|'static'} [param.options.backdrop=true] - Includes a modal-backdrop element. Alternatively, specify static for a backdrop which doesn’t close the modal when clicked.
     * @param {boolean} [param.options.focus=true] - Puts the focus on the modal when initialised.
     * @param {boolean} [param.options.keyboard=true] - Closes the modal when escape key is pressed.
     */
    create ({
      viewId,
      widgetId,
      options = {
        backdrop: true,
        focus: true,
        keyboard: true
      }
    }) {
      // fetch existing modal
      let modal = modalItems[viewId]

      if (modal instanceof Modal) {
        return
      }

      const view = $getDataValue('view/items', {
        id: viewId
      })

      // create new modal
      modal = new Modal(view.item, options)

      modalItems[viewId] = modal

      view.item.addEventListener('hidden.bs.modal', () => {
        const attachedSection = $getDataValue('widget/attached', {
          id: widgetId
        })

        if (!attachedSection.isEmpty) {
          const section = $getDataValue('section/items', {
            id: attachedSection.item,
            options: {
              clone: true
            }
          })
          const items = section.item

          for (let i = 0; i < items.length; i++) {
            const id = items[i]

            if (id === widgetId) {
              items.splice(i, 1)
              break
            }
          }

          $setDataValue('section/items', items, { id: section.id })
        }
      })

      // clean up modal
      $addDataListener('view/items', {
        on: 'delete',
        id: viewId,
        handler: () => {
          delete modalItems[viewId]
        }
      })

      return modal
    },
    /**
     * Show modal
     * @param {Object} param
     * @param {string} param.viewId - View id that the modal belongs to
     */
    show ({ viewId }) {
      const modal = modalItems[viewId]

      if (!(modal instanceof Modal)) {
        throw new Error('No modal found: ' + viewId)
      }

      modal.show()
    }
  })
})

const viewModalShow = viewModal.actions.show
const viewModalCreate = viewModal.actions.create

export {
  viewModalCreate,
  viewModalShow
}

export default viewModal
