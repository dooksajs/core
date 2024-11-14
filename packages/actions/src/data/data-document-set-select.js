import createAction from '@dooksa/create-action'

export const dataDocumentSetSelect = createAction('data-document-set-select', [
  {
    $id: 'collection_value',
    variable_setValue: {
      scope: { action_getContextValue: 'groupId' },
      values: [{
        id: 'data-document-collection',
        value: { action_getPayloadValue: 'target.value' }
      }]
    }
  },
  {
    $id: 'component_document_select',
    data_setValue: {
      name: 'component/items',
      value: {
        id: 'data-document-select',
        isTemplate: true
      }
    }
  },
  {
    $id: 'component_document_select_id',
    action_getBlockValue: {
      value: { $ref: 'component_document_select' },
      query: 'id'
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
    variable_setValue: {
      scope: { action_getContextValue: 'groupId' },
      values: [
        {
          id: 'action_card_body_label_icon',
          value: 'mdi:file-document'
        },
        {
          id: 'action_card_body_label_text',
          value: 'Document ID'
        }
      ]
    }
  },
  {
    data_setValue: {
      name: 'component/children',
      value: { $ref: 'component_document_select_id' },
      options: {
        id: { $ref: 'root_id' },
        update: {
          method: 'splice',
          startIndex: 2,
          deleteCount: 1
        }
      }
    }
  }
])
