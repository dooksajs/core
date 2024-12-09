import createAction from '@dooksa/create-action'

export default createAction('action-input-object-property-schema', [
  {
    $id: 'action_input_name',
    variable_getValue: {
      scope: { action_getContextValue: 'groupId' },
      query: 'action-input-name'
    }
  },
  {
    $id: 'schema',
    variable_getValue: {
      scope: { action_getContextValue: 'groupId' },
      query: 'action-input-schema'
    }
  },
  {
    $id: 'schema_type',
    action_getBlockValue: {
      value: { $id: 'schema' },
      query: 'type'
    }
  },
  {
    action_ifElse: {
      if: [
        {
          from: { $ref: 'schema_type' },
          to: 'string',
          op: '=='
        }
      ],
      then: [
        { $sequenceRef: 'object_property_name' },
        { $sequenceRef: 'set_variable_action_input_name' },
        { $sequenceRef: 'action_input_data_value' },
        { $sequenceRef: 'component_children_action_input_data_value' }
      ],
      else: []
    }
  },
  {
    $id: 'object_property_name',
    operator_eval: {
      name: '+',
      values: [
        { $ref: 'action_input_name' },
        '.',
        { action_getPayloadValue: 'value.name' }
      ]
    }
  },
  {
    $id: 'set_variable_action_input_name',
    variable_setValue: {
      scope: {
        action_getContextValue: 'groupId'
      },
      values: [
        {
          id: 'action-input-name',
          value: { $ref: 'object_property_name' }
        }
      ]
    }
  },
  {
    $id: 'action_input_data_value',
    state_setValue: {
      name: 'component/items',
      value: {
        id: 'action-input-data-string',
        isTemplate: true
      }
    }
  },
  {
    $id: 'component_children_action_input_data_value',
    state_setValue: {
      name: 'component/children',
      value: {
        action_getBlockValue: {
          value: { $ref: 'action_input_data_value' },
          query: 'id'
        }
      },
      options: {
        id: { action_getContextValue: 'id' },
        update: {
          method: 'push'
        }
      }
    }
  }
])
