import createAction from '@dooksa/create-action'

export default createAction('data-document-option-item', [
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
    action_setActionValue: {
      id: { action_getContextValue: 'groupId' },
      values: [
        {
          id: 'option-text',
          prefixId: { $ref: 1 },
          value: { action_getPayloadValue: 'value.id' }
        },
        {
          id: 'option-value',
          prefixId: { $ref: 1 },
          value: { action_getPayloadValue: 'value.id' }
        }
      ]
    }
  },
  {
    data_setValue: {
      name: 'component/options',
      value: { value: { action_getPayloadValue: 'value.id' } },
      options: { id: { $ref: 1 } }
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
