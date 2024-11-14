import createAction from '@dooksa/create-action'

export const actionAddBlockFetchActions = createAction('action-add-block-fetch-actions', [
  {
    fetch_getAll: {
      collection: 'metadata/actions',
      sync: true,
      expand: true
    }
  },
  {
    list_map: {
      items: { $ref: 0 },
      context: {
        id: { action_getContextValue: 'id' },
        groupId: { action_getContextValue: 'groupId' }
      },
      actionId: 'action-add-block-list-item'
    }
  }
])
