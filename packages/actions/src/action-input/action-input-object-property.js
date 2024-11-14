import createAction from '@dooksa/create-action'

export const actionInputObjectProperty = createAction('action-input-object-property', [
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
        '.',
        { action_getPayloadValue: 'key' }
      ]
    }
  },
  {
    $id: 'action_input_object_property',
    data_setValue: {
      name: 'component/items',
      value: {
        id: 'action-input-object-property',
        isTemplate: true
      }
    }
  },
  {
    $id: 'action_input_object_property_id',
    action_getBlockValue: {
      value: { $ref: 'action_input_object_property' },
      query: 'id'
    }
  },
  { // set input values to "local scope"
    variable_setValue: {
      scope: { $ref: 'action_input_object_property_id' },
      values: [
        {
          id: 'action-input-root-id',
          value: { $ref: 'action_input_object_property_id' }
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
          id: 'action-input-title',
          value: { action_getPayloadValue: 'key' }
        }
      ]
    }
  },
  {
    data_setValue: {
      name: 'component/children',
      value: { $ref: 'action_input_object_property_id' },
      options: {
        id: { action_getContextValue: 'id' },
        update: {
          method: 'push'
        }
      }
    }
  }
])
