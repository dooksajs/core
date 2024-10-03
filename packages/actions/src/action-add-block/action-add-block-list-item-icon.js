import createAction from '@dooksa/create-action'

export default createAction('action-add-block-list-item-icon', [
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
      name: 'component/options',
      value: {
        icon: {
          action_getBlockValue: {
            query: 'item.icon',
            value: { $ref: 1 }
          }
        }
      },
      options: {
        id: { action_getContextValue: 'id' },
        merge: true
      }
    }
  }
])
