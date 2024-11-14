import createAction from '@dooksa/create-action'

export const actionInputData = createAction('action-input-data', [
  {
    $id: 'data_item',
    variable_getValue: {
      query: 'action-input-value'
    }
  },
  {
    action_ifElse: {
      if: [
        {
          from: { $ref: 'data_item' },
          op: '!!'
        }
      ],
      then: [
        { $sequenceRef: 'data_type' },
        { $sequenceRef: 'if_data_type_string' }
      ],
      else: [
        // { $sequenceRef: 'schema' },
        // { $sequenceRef: 'ifElse_schema' }
      ]
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
        { $sequenceRef: 'data_item_object' },
        { $sequenceRef: 'data_item_object_id' },
        { $sequenceRef: 'append_data_item_object' }
      ],
      else: [
        // { $sequenceRef: 'if_data_type_array' }
      ]
    }
  },
  {
    $id: 'data_item_object',
    data_setValue: {
      name: 'component/items',
      value: {
        id: 'action-input-object-property',
        isTemplate: true
      }
    }
  },
  {
    $id: 'data_item_object_id',
    action_getBlockValue: {
      value: { $ref: 'data_item_object' },
      query: 'id'
    }
  },
  {
    $id: 'append_data_item_object',
    data_setValue: {
      name: 'component/children',
      value: { $ref: 'data_item_object_id' },
      options: {
        id: { action_getContextValue: 'id' },
        update: {
          method: 'push'
        }
      }
    }
  }
])
