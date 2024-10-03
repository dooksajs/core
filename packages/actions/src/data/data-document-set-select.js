import createAction from '@dooksa/create-action'

export default createAction('data-document-set-select', [
  {
    action_setActionValue: {
      id: { action_getContextValue: 'groupId' },
      values: [{
        id: 'data-document-collection',
        value: { action_getPayloadValue: 'target.value' }
      }]
    }
  },
  {
    data_setValue: {
      name: 'component/items',
      value: {
        id: 'data-document-select',
        isTemplate: true
      }
    }
  },
  {
    data_setValue: {
      name: 'component/children',
      value: {
        action_getBlockValue: {
          value: { $ref: 1 },
          query: 'id'
        }
      },
      options: {
        id: {
          action_getActionValue: {
            id: { action_getContextValue: 'groupId' },
            query: 'data-document-root-id'
          }
        },
        update: {
          method: 'splice',
          startIndex: 2,
          deleteCount: 1
        }
      }
    }
  }
])
