import createAction from '@dooksa/create-action'

export default createAction('action-input-array-item', [
  {
    $id: 'action_input_name',
    variable_getValue: {
      query: 'action-input-name'
    }
  },
  {
    $id: 'object_property_name',
    operator_eval: {
      name: '+',
      values: [
        { $ref: 'action_input_name' },
        '[',
        { action_getPayloadValue: 'key' },
        ']'
      ]
    }
  },
  {
    $id: 'action_input_array_item',
    state_setValue: {
      name: 'component/items',
      value: {
        id: 'action-input-array-item',
        isTemplate: true
      }
    }
  },
  {
    $id: 'action_input_array_item_id',
    action_getValue: {
      value: { $ref: 'action_input_array_item' },
      query: 'id'
    }
  },
  { // set input values to "local scope"
    variable_setValue: {
      scope: { $ref: 'action_input_array_item_id' },
      values: [
        {
          id: 'action-input-root-id',
          value: { $ref: 'action_input_array_item_id' }
        },
        {
          id: 'action-input-value',
          value: { action_getPayloadValue: 'value' }
        },
        {
          id: 'action-input-name',
          value: { $ref: 'object_property_name' }
        },
        {
          id: 'action-input-key',
          value: { action_getPayloadValue: 'key' }
        }
      ]
    }
  },
  {
    state_setValue: {
      name: 'component/children',
      value: { $ref: 'action_input_array_item_id' },
      options: {
        id: { action_getContextValue: 'id' },
        update: {
          method: 'push'
        }
      }
    }
  }
])
