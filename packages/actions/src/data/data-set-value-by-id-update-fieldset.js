import createAction from '@dooksa/create-action'

export const dataSetValueByIdUpdateFieldset = createAction('data-set-value-by-id-update-fieldset', [
  {
    action_ifElse: {
      if: [
        {
          left: { action_getPayloadValue: 'target.value' },
          right: 'document-by-id',
          op: '=='
        }
      ],
      then: [
        { $sequenceRef: 'component_select_document' },
        { $sequenceRef: 'component_select_document_id' },
        { $sequenceRef: 'component_children_root_select_document' }
      ],
      else: []
    }
  },
  {
    $id: 'component_select_document',
    state_setValue: {
      name: 'component/items',
      value: {
        id: 'data-select-document-by-id',
        isTemplate: true
      }
    }
  },
  {
    $id: 'component_select_document_id',
    action_getValue: {
      value: { $ref: 1 },
      query: 'id'
    }
  },
  {
    $id: 'component_children_root_select_document',
    state_setValue: {
      name: 'component/children',
      value: { $ref: 'component_select_document_id' },
      options: {
        id: { action_getContextValue: 'rootId' },
        update: {
          method: 'splice',
          startIndex: 2,
          deleteCount: 1
        }
      }
    }
  }
])
