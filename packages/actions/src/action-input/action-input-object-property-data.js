import createAction from '@dooksa/create-action'

export const actionInputObjectPropertyData = createAction('action-input-object-property-data', [
  {
    $id: 'action_input_name',
    variable_getValue: {
      query: 'action-input-name'
    }
  },
  {
    $id: 'data_type',
    operator_eval: {
      name: 'typeof',
      values: [{ action_getPayloadValue: '$null' }]
    }
  },
  {
    action_ifElse: {
      if: [
        {
          from: { $ref: 'data_type' },
          to: 'string',
          op: '=='
        }
      ],
      then: [
        { $sequenceRef: 'action_input_data_property_label' },
        { $sequenceRef: 'action_input_data_property_label_id' },
        { $sequenceRef: 'action_input_data_value' },
        { $sequenceRef: 'action_input_data_value_id' },
        { $sequenceRef: 'component_children_action_input_data_property_label' },
        { $sequenceRef: 'component_children_action_input_data_value' }
      ],
      else: []
    }
  },
  {
    $id: 'action_input_data_property_label',
    data_setValue: {
      name: 'component/items',
      value: {
        id: 'action-input-data-property-label',
        isTemplate: true
      }
    }
  },
  {
    $id: 'action_input_data_property_label_id',
    action_getBlockValue: {
      value: { $ref: 'action_input_data_property_label' },
      query: 'id'
    }
  },
  {
    $id: 'action_input_data_value',
    data_setValue: {
      name: 'component/items',
      value: {
        id: 'action-input-data-string',
        isTemplate: true
      }
    }
  },
  {
    $id: 'action_input_data_value_id',
    action_getBlockValue: {
      value: { $ref: 'action_input_data_value' },
      query: 'id'
    }
  },
  {
    $id: 'component_children_action_input_data_property_label',
    data_setValue: {
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
    $id: 'component_children_action_input_data_value',
    data_setValue: {
      name: 'component/children',
      value: {
        $ref: 'action_input_data_value_id'
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
  }
])
