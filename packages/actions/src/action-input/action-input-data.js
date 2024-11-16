import createAction from '@dooksa/create-action'

export const actionInputData = createAction('action-input-data', [
  {
    $id: 'data_item',
    variable_getValue: {
      query: 'action-input-value'
    }
  },
  {
    $id: 'data_type',
    operator_eval: {
      name: 'typeof',
      values: [{ $ref: 'data_item' }]
    }
  },
  {
    action_ifElse: {
      if: [
        {
          from: { $ref: 'data_type' },
          to: 'undefined',
          op: '!='
        }
      ],
      then: [
        { $sequenceRef: 'if_data_type_string' }
      ],
      else: [
        // { $sequenceRef: 'schema' },
        // { $sequenceRef: 'ifElse_schema' }
      ]
    }
  },
  {
    $id: 'if_data_type_string',
    action_ifElse: {
      if: [
        {
          from: { $ref: 'data_type' },
          to: 'string',
          op: '=='
        }
      ],
      then: [
        { $sequenceRef: 'data_item_string' },
        { $sequenceRef: 'data_item_string_id' },
        { $sequenceRef: 'append_data_item_string' }
      ],
      else: [{ $sequenceRef: 'if_data_type_object' }]
    }
  },
  {
    $id: 'data_item_string',
    data_setValue: {
      name: 'component/items',
      value: {
        id: 'action-input-data-string',
        isTemplate: true
      }
    }
  },
  {
    $id: 'data_item_string_id',
    action_getBlockValue: {
      value: { $ref: 'data_item_string' },
      query: 'id'
    }
  },
  {
    $id: 'append_data_item_string',
    data_setValue: {
      name: 'component/children',
      value: { $ref: 'data_item_string_id' },
      options: {
        id: { action_getContextValue: 'id' },
        update: {
          method: 'push'
        }
      }
    }
  },
  {
    $id: 'if_data_type_object',
    action_ifElse: {
      if: [
        {
          from: { $ref: 'data_type' },
          to: 'object',
          op: '=='
        }
      ],
      then: [
        { $sequenceRef: 'data_item_object_properties' }
      ],
      else: [
        { $sequenceRef: 'if_data_type_array' }
      ]
    }
  },
  {
    $id: 'data_item_object_properties',
    list_map: {
      items: { $ref: 'data_item' },
      actionId: 'action-input-object-property'
    }
  },
  {
    $id: 'if_data_type_array',
    action_ifElse: {
      if: [
        {
          from: { $ref: 'data_type' },
          to: 'array',
          op: '=='
        }
      ],
      then: [
        { $sequenceRef: 'data_item_list' }
      ],
      else: []
    }
  },
  {
    $id: 'data_item_list',
    list_map: {
      items: { $ref: 'data_item' },
      actionId: 'action-input-array-item'
    }
  }
])
