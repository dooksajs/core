import createAction from '@dooksa/create-action'

export default createAction('action-add-block-expand', [
  {
    api_getAll: {
      collection: 'metadata/actions',
      sync: true,
      expand: true
    }
  },
  {
    action_getValue: {
      query: 'item',
      value: { $ref: 0 }
    }
  },
  {
    list_map: {
      items: { $ref: 1 },
      context: {
        id: { action_getContextValue: 'id' },
        groupId: { action_getContextValue: 'groupId' }
      },
      actionId: 'action-add-block-list-item'
    }
  }
])
