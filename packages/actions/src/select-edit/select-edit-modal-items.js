import createAction from '@dooksa/create-action'

export default createAction('select-edit-modal-items', [
  {
    get_actionValue: {
      id: {
        get_contextValue: 'rootId'
      },
      query: 'componentId'
    }
  },
  {
    eval_condition: {
      if: [
        {
          from: {
            get_blockValue: {
              value: {
                get_dataValue: {
                  name: 'component/items',
                  query: {
                    id: {
                      get_sequenceValue: '0'
                    }
                  }
                }
              },
              query: 'type'
            }
          },
          to: 'img',
          op: '=='
        }
      ],
      then: [2],
      else: []
    }
  },
  {
    action_dispatch: {
      id: 'edit-img',
      context: {
        id: {
          get_sequenceValue: '0'
        },
        parentId: {
          get_contextValue: 'id'
        }
      }
    }
  }
])
