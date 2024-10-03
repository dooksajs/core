import createAction from '@dooksa/create-action'

export default createAction('data-set-value-by-id-update-fieldset', [
  {
    action_ifElse: {
      if: [
        {
          from: { action_getPayloadValue: 'target.value' },
          to: 'document-by-id',
          op: '=='
        }
      ],
      then: [{ $sequenceRef: 1 }, { $sequenceRef: 2 }],
      else: []
    }
  },
  {
    data_setValue: {
      name: 'component/items',
      value: {
        id: 'data-select-document-by-id',
        isTemplate: true
      }
    }
  },
  {
    data_setValue: {
      name: 'component/children',
      value: {
        action_getBlockValue: {
          value: { $ref: 1 },
          query: 'id'
        }
      },
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
