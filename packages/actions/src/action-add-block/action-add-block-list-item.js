import createAction from '@dooksa/create-action'

export const actionAddBlockListItem = createAction('action-add-block-list-item', [
  {
    state_setValue: {
      name: 'component/items',
      value: {
        id: 'action-add-block-list-item',
        isTemplate: true,
        groupId: { action_getContextValue: 'groupId' }
      }
    }
  },
  {
    action_getBlockValue: {
      query: 'id',
      value: { $ref: 0 }
    }
  },
  {
    variable_setValue: {
      scope: { action_getContextValue: 'groupId' },
      values: [
        {
          id: 'metadata',
          prefixId: { $ref: 1 },
          value: { action_getPayloadValue: 'value.id' }
        }
      ]
    }
  },
  {
    state_setValue: {
      name: 'component/children',
      value: { $ref: 1 },
      options: {
        id: { action_getContextValue: 'id' },
        update: { method: 'push' }
      }
    }
  }
])
