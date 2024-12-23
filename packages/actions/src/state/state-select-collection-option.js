import createAction from '@dooksa/create-action'

export default createAction('state-select-collection-option', [
  {
    $id: 'option_value',
    state_setValue: {
      name: 'component/items',
      value: {
        id: 'option-variable-value',
        isTemplate: true
      }
    }
  },
  {
    $id: 'option_value_id',
    action_getValue: {
      value: { $ref: 'option_value' },
      query: 'id'
    }
  },
  {
    variable_setValue: {
      scope: { action_getContextValue: 'groupId' },
      values: [
        {
          id: 'option-text',
          prefixId: { $ref: 'option_value_id' },
          value: { action_getPayloadValue: 'value' }
        },
        {
          id: 'option-value',
          prefixId: { $ref: 'option_value_id' },
          value: { action_getPayloadValue: 'value' }
        }
      ]
    }
  },
  {
    list_push: {
      target: {
        action_getContextValue: '$list'
      },
      source: { $ref: 'option_value_id' }
    }
  }
])
