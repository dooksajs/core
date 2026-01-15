import createAction from '@dooksa/create-action'

export default createAction('input-id', [
  {
    variable_getValue: {
      scope: { action_getContextValue: 'groupId' },
      query: 'input-id'
    }
  },
  {
    action_ifElse: {
      if: [
        {
          op: '!!',
          left: { $ref: 0 },
          right: true
        }
      ],
      then: [{ $sequenceRef: 2 }, { $sequenceRef: 3 }],
      else: [{ $sequenceRef: 4 }, { $sequenceRef: 5 }, { $sequenceRef: 6 }]
    }
  },
  {
    state_setValue: {
      name: 'component/options',
      value: { id: { $ref: 0 } },
      options: {
        id: { action_getContextValue: 'id' },
        merge: true
      }
    }
  },
  {
    variable_setValue: {
      scope: { action_getContextValue: 'groupId' },
      values: [
        {
          id: 'input-id',
          value: ''
        }
      ]
    }
  },
  { state_generateId: '$null' },
  {
    variable_setValue: {
      scope: { action_getContextValue: 'groupId' },
      values: [
        {
          id: 'input-id',
          value: { $ref: 4 }
        }
      ]
    }
  },
  {
    state_setValue: {
      name: 'component/options',
      value: { id: { $ref: 4 } },
      options: {
        id: { action_getContextValue: 'id' },
        merge: true
      }
    }
  }
])
