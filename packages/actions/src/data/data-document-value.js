import createAction from '@dooksa/create-action'

export const dataDocumentValue = createAction('data-document-value', [
  {
    $id: 'collection_value',
    variable_getValue: {
      scope: { action_getContextValue: 'groupId' },
      query: 'data-document-collection'
    }
  },
  {
    $id: 'document_result',
    data_getValue: {
      name: { $ref: 'collection_value' },
      id: { action_getPayloadValue: 'target.value' }
    }
  },
  {
    $id: 'document_item',
    action_getBlockValue: {
      value: { $ref: 'document_result' },
      query: 'item'
    }
  },
  {
    $id: 'schema',
    editor_getSchema: { $ref: 'collection_value' }
  },
  {
    $id: 'data_type',
    operator_eval: {
      name: 'typeof',
      values: [{ $ref: 'document_item' }]
    }
  },
  {
    $id: 'root_id',
    variable_getValue: {
      scope: { action_getContextValue: 'groupId' },
      query: 'variable_context_id'
    }
  },
  {
    $id: 'value_label',
    variable_setValue: {
      scope: { action_getContextValue: 'groupId' },
      values: [
        {
          id: 'action_card_body_label_text',
          value: 'Value'
        },
        {
          id: 'action_card_body_label_icon',
          value: 'mdi:pen'
        }
      ]
    }
  },
  {
    $id: 'set_variable_action_input_name',
    variable_setValue: {
      scope: { action_getContextValue: 'groupId' },
      values: [
        {
          id: 'action-input-name',
          value: 'value'
        },
        {
          id: 'action-input-value',
          value: { $ref: 'document_item' }
        }
      ]
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
        { $sequenceRef: 'action_input_string' },
        { $sequenceRef: 'action_input_string_id' },
        { $sequenceRef: 'append_action_input_string' }
      ],
      else: [
        { $sequenceRef: 'ifelse_handle_object' }
      ]
    }
  },
  {
    $id: 'action_input_string',
    data_setValue: {
      name: 'component/items',
      value: {
        id: 'action-input-string',
        isTemplate: true
      }
    }
  },
  {
    $id: 'action_input_string_id',
    action_getBlockValue: {
      value: { $ref: 'action_input_string' },
      query: 'id'
    }
  },
  {
    $id: 'append_action_input_string',
    data_setValue: {
      name: 'component/children',
      value: { $ref: 'action_input_string_id' },
      options: {
        id: {
          $ref: 'root_id'
        },
        update: {
          method: 'splice',
          startIndex: 3,
          deleteCount: 1
        }
      }
    }
  },
  {
    $id: 'ifelse_handle_object',
    action_ifElse: {
      if: [
        {
          from: { $ref: 'data_type' },
          to: 'object',
          op: '=='
        }
      ],
      then: [
        { $sequenceRef: 'action_input_object' },
        { $sequenceRef: 'action_input_object_id' },
        { $sequenceRef: 'schema_properties' },
        { $sequenceRef: 'schema_properties_action_input_value' },
        { $sequenceRef: 'component_children_action_input_object' }
      ],
      else: [{
        $sequenceRef: 'ifelse_handle_array'
      }]
    }
  },
  {
    $id: 'action_input_object',
    data_setValue: {
      name: 'component/items',
      value: {
        id: 'action-input-object',
        isTemplate: true
      }
    }
  },
  {
    $id: 'action_input_object_id',
    action_getBlockValue: {
      value: { $ref: 'action_input_object' },
      query: 'id'
    }
  },
  {
    $id: 'schema_properties',
    action_getBlockValue: {
      value: { $ref: 'schema' },
      query: 'properties'
    }
  },
  {
    $id: 'schema_properties_action_input_value',
    variable_setValue: {
      scope: { $ref: 'action_input_object_id' },
      values: [
        {
          id: 'action-input-schema',
          value: { $ref: 'schema_properties' }
        }
      ]
    }
  },
  {
    $id: 'component_children_action_input_object',
    data_setValue: {
      name: 'component/children',
      value: {
        $ref: 'action_input_object_id'
      },
      options: {
        id: {
          $ref: 'root_id'
        },
        update: {
          method: 'splice',
          startIndex: 3,
          deleteCount: 1
        }
      }
    }
  },
  {
    $id: 'ifelse_handle_array',
    action_ifElse: {
      if: [
        {
          from: { $ref: 'data_type' },
          to: 'array',
          op: '=='
        }
      ],
      then: [
        { $sequenceRef: 'action_input_array_items' },
        { $sequenceRef: 'action_input_array_items_id' },
        { $sequenceRef: 'schema_items' },
        { $sequenceRef: 'schema_items_action_input_value' },
        { $sequenceRef: 'component_children_action_input_array' }
      ],
      else: []
    }
  },
  {
    $id: 'action_input_array_items',
    data_setValue: {
      name: 'component/items',
      value: {
        id: 'action-input-array-items',
        isTemplate: true
      }
    }
  },
  {
    $id: 'action_input_array_items_id',
    action_getBlockValue: {
      value: { $ref: 'action_input_array_items' },
      query: 'id'
    }
  },
  {
    $id: 'schema_items',
    action_getBlockValue: {
      value: { $ref: 'schema' },
      query: 'items'
    }
  },
  {
    $id: 'schema_items_action_input_value',
    variable_setValue: {
      scope: { $ref: 'action_input_array_items_id' },
      values: [
        {
          id: 'action-input-schema',
          value: { $ref: 'schema_items' }
        }
      ]
    }
  },
  {
    $id: 'component_children_action_input_array',
    data_setValue: {
      name: 'component/children',
      value: {
        $ref: 'action_input_array_items_id'
      },
      options: {
        id: {
          $ref: 'root_id'
        },
        update: {
          method: 'splice',
          startIndex: 3,
          deleteCount: 1
        }
      }
    }
  }
])
