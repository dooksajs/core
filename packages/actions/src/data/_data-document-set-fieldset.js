import createAction from '@dooksa/create-action'

export default createAction('data-document-set-fieldset', [
  {
    $id: 'collection_value',
    variable_getValue: {
      scope: { action_getContextValue: 'groupId' },
      query: 'data-document-collection'
    }
  },
  {
    $id: 'document_value',
    state_getValue: {
      name: { $ref: 'collection_value' },
      id: { action_getPayloadValue: 'target.value' }
    }
  },
  {
    $id: 'document_item',
    action_getValue: {
      value: { $ref: 'document_value' },
      query: 'item'
    }
  },
  {
    $id: 'schema',
    editor_getSchema: { $ref: 'collection_value' }
  },
  {
    $id: 'schema_type',
    action_getValue: {
      value: { $ref: 'schema' },
      query: 'type'
    }
  },
  {
    $id: 'parent_component',
    state_getValue: {
      name: 'component/parents',
      id: {
        action_getContextValue: 'parentId'
      }
    }
  },
  {
    $id: 'component_action_label_value',
    state_setValue: {
      name: 'component/items',
      value: {
        id: 'data-document-value-label',
        isTemplate: true
      }
    }
  },
  {
    $id: 'parent_component_id',
    action_getValue: {
      value: { $ref: 'parent_component' },
      query: 'item'
    }
  },
  {
    $id: 'component_action_label_value_id',
    action_getValue: {
      value: { $ref: 'component_action_label_value' },
      query: 'id'
    }
  },
  {
    $id: 'component_children_action_label_value',
    state_setValue: {
      name: 'component/children',
      value: { $ref: 'component_action_label_value_id' },
      options: {
        id: {
          $ref: 'parent_component_id'
        },
        update: {
          method: 'splice',
          startIndex: 3,
          deleteCount: 2
        }
      }
    }
  },
  {
    action_ifElse: {
      if: [
        {
          left: { $ref: 'schema_type' },
          right: 'string',
          op: '=='
        }
      ],
      then: [
        { $sequenceRef: 'action_input_data' },
        { $sequenceRef: 'set_variable_action_input_string' },
        { $sequenceRef: 'component_children_action_input_data' }
      ],
      else: [
        { $sequenceRef: 'ifElse_handle_object' }
      ]
    }
  },
  {
    $id: 'action_input_data',
    state_setValue: {
      name: 'component/items',
      value: {
        id: 'action-input-data-string',
        isTemplate: true
      }
    }
  },
  {
    $id: 'set_variable_action_input_string',
    variable_setValue: {
      scope: {
        action_getContextValue: 'groupId'
      },
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
    $id: 'component_children_action_input_data',
    state_setValue: {
      name: 'component/children',
      value: {
        action_getValue: {
          value: { $ref: 'action_input_data' },
          query: 'id'
        }
      },
      options: {
        id: {
          action_getContextValue: 'parentId'
        },
        update: {
          method: 'splice',
          startIndex: 1,
          deleteCount: 1
        }
      }
    }
  },
  {
    $id: 'ifElse_handle_object',
    action_ifElse: {
      if: [
        {
          left: { $ref: 'schema_type' },
          right: 'object',
          op: '=='
        }
      ],
      then: [
        { $sequenceRef: 'action_input_data_name' },
        { $sequenceRef: 'object_properties' },
        { $sequenceRef: 'action_input_data_object' }
      ],
      else: []
    }
  },
  {
    $id: 'action_input_data_name',
    variable_setValue: {
      scope: { action_getContextValue: 'groupId' },
      values: [
        {
          id: 'action_input_data_name',
          prefixId: { action_getContextValue: 'id' },
          value: 'value'
        }
      ]
    }
  },
  {
    $id: 'object_properties',
    action_getValue: {
      value: { $ref: 'document_item' },
      query: 'properties'
    }
  },
  {
    $id: 'action_input_data_object',
    list_map: {
      items: { $ref: 'object_properties' },
      actionId: 'action-input-data-object'
    }
  }
])
