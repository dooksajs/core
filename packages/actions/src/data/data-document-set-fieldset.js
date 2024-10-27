import createAction from '@dooksa/create-action'

export default createAction('data-document-set-fieldset', [
  {
    variable_getValue: {
      scope: { action_getContextValue: 'groupId' },
      query: 'data-document-collection'
    }
  },
  {
    editor_getSchema: { $ref: 0 }
  },
  {
    action_ifElse: {
      if: [
        {
          from: {
            action_getBlockValue: {
              value: { $ref: 1 },
              query: 'type'
            }
          },
          to: 'string',
          op: '=='
        }
      ],
      then: [{ $sequenceRef: 3 }, { $sequenceRef: 4 }, { $sequenceRef: 5 }, { $sequenceRef: 6 }],
      else: []
    }
  },
  {
    data_setValue: {
      name: 'component/items',
      value: {
        id: 'action-input-data',
        isTemplate: true
      }
    }
  },
  {
    data_getValue: {
      name: { $ref: 0 },
      id: { action_getPayloadValue: 'target.value' }
    }
  },
  {
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
          value: {
            action_getBlockValue: {
              value: { $ref: 4 },
              query: 'item'
            }
          }
        }
      ]
    }
  },
  {
    data_setValue: {
      name: 'component/children',
      value: {
        action_getBlockValue: {
          value: { $ref: 3 },
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
  }
])
