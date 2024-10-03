import createAction from '@dooksa/create-action'

export default createAction('action-add-block-list-item-title', [
  {
    action_getActionValue: {
      id: { action_getContextValue: 'groupId' },
      prefixId: { action_getContextValue: 'rootId' },
      query: 'metadata'
    }
  },
  {
    data_getValue: {
      id: { $ref: 0 },
      name: 'metadata/actions'
    }
  },
  {
    data_setValue: {
      name: 'content/items',
      value: {
        value: {
          action_getBlockValue: {
            query: 'item.title',
            value: { $ref: 1 }
          }
        }
      },
      options: { id: { action_getContextValue: 'contentId' } }
    }
  }
])
