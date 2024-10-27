import createAction from '@dooksa/create-action'

export default createAction('data-collection-option-item', [
  {
    data_setValue: {
      name: 'component/items',
      value: {
        id: 'option-variable-value',
        isTemplate: true
      }
    }
  },
  {
    action_getBlockValue: {
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
    data_setValue: {
      name: 'component/children',
      value: { $ref: 1 },
      options: {
        id: { action_getContextValue: 'id' },
        update: { method: 'push' }
      }
    }
  }
])
