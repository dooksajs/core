import createAction from '@dooksa/create-action'

export default createAction('select-edit-inner', [
  {
    action_getDataValue: {
      name: 'component/children',
      id: {
        action_getContextValue: 'id'
      }
    }
  },
  {
    action_ifElse: {
      if: [{
        op: '>',
        from: {
          action_getValue: {
            value: {
              $ref: 0
            },
            query: 'length'
          }
        },
        to: 0
      }],
      then: [{ $sequenceRef: 2 }, { $sequenceRef: 3 }],
      else: []
    }
  },
  {
    list_map: {
      items: {
        $ref: 0
      },
      context: {
        action_getContextValue: '$null'
      },
      actionId: 'select-edit-inner-iterate'
    }
  },
  {
    state_setValue: {
      name: 'component/children',
      value: {
        $ref: 2
      },
      options: {
        id: {
          action_getContextValue: 'id'
        }
      }
    }
  }
], ['select-edit-inner-iterate'])
