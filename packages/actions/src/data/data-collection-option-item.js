import createAction from '@dooksa/create-action'

export const dataCollectionOptionItem = createAction('data-collection-option-item', [
  {
    state_setValue: {
      name: 'component/items',
      value: {
        id: 'option-variable-value',
        isTemplate: true
      }
    }
  },
  {
    action_getValue: {
      value: { $ref: 0 },
      query: 'id'
    }
  },
  {
    variable_setValue: {
      scope: { action_getContextValue: 'groupId' },
      values: [
        {
          id: 'option-text',
          prefixId: { $ref: 1 },
          value: { action_getPayloadValue: 'value' }
        },
        {
          id: 'option-value',
          prefixId: { $ref: 1 },
          value: { action_getPayloadValue: 'value' }
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
