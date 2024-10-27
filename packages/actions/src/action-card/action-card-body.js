import createAction from '@dooksa/create-action'

export default createAction('action-card-body', [
  {
    variable_getValue: {
      scope: { action_getContextValue: 'groupId' },
      query: 'metadata'
    }
  },
  {
    data_getValue: {
      id: { $ref: 0 },
      name: 'metadata/actions'
    }
  },
  {
    action_getBlockValue: {
      query: 'item.component',
      value: { $ref: 1 }
    }
  },
  {
    action_ifElse: {
      if: [
        {
          from: { $ref: 2 },
          to: true,
          op: '!!'
        }
      ],
      then: [{ $sequenceRef: 4 }, { $sequenceRef: 5 }],
      else: []
    }
  },
  {
    data_setValue: {
      name: 'component/items',
      value: {
        id: { $ref: 2 },
        isTemplate: true
      }
    }
  },
  {
    data_setValue: {
      name: 'component/children',
      value: {
        action_getBlockValue: {
          query: 'id',
          value: { $ref: 4 }
        }
      },
      options: {
        id: { action_getContextValue: 'id' },
        update: { method: 'push' }
      }
    }
  }
])
