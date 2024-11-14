import createAction from '@dooksa/create-action'

export default createAction('select-edit-modal-items', [
  {
    variable_getValue: {
      scope: {
        action_getContextValue: 'rootId'
      },
      query: 'componentId'
    }
  },
  {
    action_ifElse: {
      if: [
        {
          from: {
            action_getBlockValue: {
              value: {
                action_getDataValue: {
                  name: 'component/items',
                  id: {
                    $ref: 0
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
      then: [{ $sequenceRef: 2 }],
      else: []
    }
  },
  {
    action_dispatch: {
      id: 'edit-img',
      context: {
        id: {
          $ref: 0
        },
        parentId: {
          action_getContextValue: 'id'
        }
      }
    }
  }
])
