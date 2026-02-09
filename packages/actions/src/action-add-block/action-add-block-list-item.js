import createAction from '@dooksa/create-action'

export const actionAddBlockListItem = createAction('action-add-block-list-item', [
  {
    $id: 'component_result',
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
    $id: 'component_id',
    action_getValue: {
      query: 'id',
      value: { $ref: 'component_result' }
    }
  },
  {
    variable_setValue: {
      scope: { action_getContextValue: 'groupId' },
      values: [
        {
          id: 'metadata',
          prefixId: { $ref: 'component_id' },
          value: { action_getPayloadValue: 'value.id' }
        }
      ]
    }
  },
  {
    state_setValue: {
      name: 'component/children',
      value: { $ref: 'component_id' },
      options: {
        id: { action_getContextValue: 'id' },
        update: { method: 'push' }
      }
    }
  }
])
