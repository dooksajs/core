import createAction from '@dooksa/create-action'

export default createAction('state-select-collection-options', [
  {
    $id: 'select_options',
    list_map: {
      actionId: 'state-select-collection-option',
      items: {
        action_getValue: {
          value: { state_getValue: { name: 'data/collections' } },
          query: 'item'
        }
      }
    }
  },
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
          value: '- Select collection -'
        },
        {
          id: 'option-value',
          prefixId: { $ref: 'option_value_id' },
          value: ''
        }
      ]
    }
  },
  {
    list_splice: {
      start: 0,
      target: { $ref: 'select_options' },
      source: { $ref: 'option_value_id' }
    }
  },
  {
    state_setValue: {
      name: 'component/children',
      value: { $ref: 'select_options' },
      options: {
        id: { action_getContextValue: 'id' },
        merge: true
      }
    }
  }
])
