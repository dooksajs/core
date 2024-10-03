import createAction from '@dooksa/create-action'

export default createAction('label-html-for', [
  {
    action_getActionValue: {
      id: {
        action_getContextValue: 'groupId'
      },
      query: 'input-id'
    }
  },
  {
    action_ifElse: {
      if: [
        {
          op: '!!',
          from: {
            $ref: 0
          },
          to: true
        }
      ],
      then: [{ $sequenceRef: 2 }, { $sequenceRef: 3 }],
      else: [{ $sequenceRef: 4 }, { $sequenceRef: 5 }, { $sequenceRef: 6 }]
    }
  },
  {
    data_setValue: {
      name: 'component/options',
      value: {
        for: {
          $ref: 0
        }
      },
      options: {
        id: {
          action_getContextValue: 'id'
        },
        merge: true
      }
    }
  },
  {
    action_setActionValue: {
      id: {
        action_getContextValue: 'groupId'
      },
      values: [
        {
          id: 'input-id',
          value: ''
        }
      ]
    }
  },
  {
    data_generateId: '$null'
  },
  {
    action_setActionValue: {
      id: {
        action_getContextValue: 'groupId'
      },
      values: [
        {
          id: 'input-id',
          value: {
            $ref: 4
          }
        }
      ]
    }
  },
  {
    data_setValue: {
      name: 'component/options',
      value: {
        for: {
          $ref: 4
        }
      },
      options: {
        id: {
          action_getContextValue: 'id'
        },
        merge: true
      }
    }
  }
])
