import createAction from '@dooksa/create-action'

export default createAction('select-edit-outer', [
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
          action_getBlockValue: {
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
      actionId: 'select-edit-outer-iterate'
    }
  },
  {
    data_setValue: {
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
], ['select-edit-outer-iterate'])
