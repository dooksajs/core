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
    $id: 'component-content-id',
    variable_getValue: {
      scope: { action_getContextValue: 'groupId' },
      query: 'component-content-id'
    }
          }
  },
  {
    variable_setValue: {
      scope: { action_getContextValue: 'groupId' },
      values: [
        {
          id: 'component-content-id',
          value: {
            $ref: 1
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
