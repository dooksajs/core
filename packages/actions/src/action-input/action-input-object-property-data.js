import createAction from '@dooksa/create-action'

export default createAction('action-input-object-property-data', [
  {
    $id: 'data_type',
    operator_eval: {
      name: 'typeof',
      values: [{ action_getPayloadValue: '$null' }]
    }
  },
  {
    $id: 'action_input_data_property_label',
    state_setValue: {
      name: 'component/items',
      value: {
        id: 'action-input-data-property-label',
        isTemplate: true
      }
    }
  },
  {
    $id: 'action_input_data_property_label_id',
    action_getValue: {
      value: { $ref: 'action_input_data_property_label' },
      query: 'id'
    }
  },
  {
    $id: 'component_children_action_input_data_property_label',
    state_setValue: {
      name: 'component/children',
      value: {
        $ref: 'action_input_data_property_label_id'
      },
      options: {
        id: { action_getContextValue: 'id' },
        update: {
          method: 'splice',
          startIndex: 1,
          deleteCount: 1
        }
      }
    }
  },
  {
    action_ifElse: {
      if: [
        {
          left: { $ref: 'data_type' },
          right: 'string',
          op: '=='
        }
      ],
      then: [
        { $sequenceRef: 'action_input_data_string' },
        { $sequenceRef: 'action_input_data_string_id' },
        { $sequenceRef: 'append_action_input_data_string' }
      ],
      else: [
        { $sequenceRef: 'value_type' },
        { $sequenceRef: 'if_data_value_object' }
      ]
    }
  },
  {
    $id: 'action_input_data_string',
    state_setValue: {
      name: 'component/items',
      value: {
        id: 'action-input-data-string',
        isTemplate: true
      }
    }
  },
  {
    $id: 'action_input_data_string_id',
    action_getValue: {
      value: { $ref: 'action_input_data_string' },
      query: 'id'
    }
  },
  {
    $id: 'append_action_input_data_string',
    state_setValue: {
      name: 'component/children',
      value: {
        $ref: 'action_input_data_string_id'
      },
      options: {
        id: { action_getContextValue: 'id' },
        update: {
          method: 'splice',
          startIndex: 2,
          deleteCount: 1
        }
      }
    }
  },
  {
    $id: 'value_type',
    operator_eval: {
      name: 'typeof',
      values: [{ action_getPayloadValue: 'value' }]
    }
  },
  {
    $id: 'if_data_value_object',
    action_ifElse: {
      if: [
        {
          left: { $ref: 'value_type' },
          right: 'object',
          op: '=='
        }
      ],
      then: [
        { $sequenceRef: 'action_input_object_properties' },
        { $sequenceRef: 'action_input_object_properties_id' },
        { $sequenceRef: 'action_input_name' },
        { $sequenceRef: 'object_property_name' },
        { $sequenceRef: 'action_input_local_scope' },
        { $sequenceRef: 'append_action_input_object_properties' }
      ],
      else: [
      ]
    }
  },
  {
    $id: 'action_input_object_properties',
    state_setValue: {
      name: 'component/items',
      value: {
        id: 'action-input-object-properties',
        isTemplate: true
      }
    }
  },
  {
    $id: 'action_input_object_properties_id',
    action_getValue: {
      value: { $ref: 'action_input_object_properties' },
      query: 'id'
    }
  },
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
    $id: 'action_input_local_scope',
    variable_setValue: {
      scope: { $ref: 'action_input_object_properties_id' },
      values: [
        {
          id: 'action-input-root-id',
          value: { $ref: 'action_input_object_properties_id' }
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
    $id: 'append_action_input_object_properties',
    state_setValue: {
      name: 'component/children',
      value: {
        $ref: 'action_input_object_properties_id'
      },
      options: {
        id: { action_getContextValue: 'id' },
        update: {
          method: 'splice',
          startIndex: 2,
          deleteCount: 1
        }
      }
    }
  },
  {
    $id: 'value_type',
    operator_eval: {
      name: 'typeof',
      values: [{ action_getPayloadValue: 'value' }]
    }
  }
])
