import createAction from '@dooksa/create-action'

export default createAction('action-add-block-fetch-actions', [
  {
    fetch_getAll: {
      collection: 'metadata/actions',
      sync: true,
      expand: true
    }
  },
  {
    action_setActionValue: {
      id: { action_getContextValue: 'groupId' },
      values: [
        {
          id: 'component-content-id',
          value: {
            action_getActionValue: {
              id: { action_getContextValue: 'groupId' },
              query: 'component-content-id'
            }
          }
        },
        {
          id: 'action-block-selector-id',
          value: {
            action_getActionValue: {
              id: { action_getContextValue: 'groupId' },
              query: 'action-block-selector-id'
            }
          }
        },
        {
          id: 'action-block-selector-parent-id',
          value: {
            action_getActionValue: {
              id: { action_getContextValue: 'groupId' },
              query: 'action-block-selector-parent-id'
            }
          }
        },
        {
          id: 'action-block-selector-index',
          value: {
            action_getActionValue: {
              id: { action_getContextValue: 'groupId' },
              query: 'action-block-selector-index'
            }
          }
        }
      ]
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
