import createAction from '@dooksa/create-action'

export const actionAddBlockBody = createAction('action-add-block-body', [
  {
    variable_getValue: {
      scope: { action_getContextValue: 'id' },
      query: 'hasBody'
    }
  },
  {
    action_ifElse: {
      if: [
        {
          from: { $ref: 0 },
          to: true,
          op: '!='
        }
      ],
      then: [{ $sequenceRef: 2 }, { $sequenceRef: 3 }, { $sequenceRef: 4 }],
      else: []
    }
  },
  {
    variable_setValue: {
      scope: { action_getContextValue: 'id' },
      values: [
        {
          id: 'hasBody',
          value: true
        }
      ]
    }
  },
  {
    state_setValue: {
      name: 'component/items',
      value: {
        id: 'action-add-block-body',
        isTemplate: true
      }
    }
  },
  {
    state_setValue: {
      name: 'component/children',
      value: {
        action_getBlockValue: {
          value: { $ref: 3 },
          query: 'id'
        }
      },
      options: {
        id: { action_getContextValue: 'id' },
        update: { method: 'push' }
      }
    }
  }
])
