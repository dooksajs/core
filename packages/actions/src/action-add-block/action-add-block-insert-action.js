import createAction from '@dooksa/create-action'

export default createAction('action-add-block-insert-action', [
  { data_generateId: '$null' },
  {
    action_setActionValue: {
      id: { $ref: 0 },
      groupId: { $ref: 0 },
      values: [
        {
          id: 'metadata',
          value: {
            action_getActionValue: {
              id: { action_getContextValue: 'groupId' },
              prefixId: { action_getContextValue: 'rootId' },
              query: 'metadata'
            }
          }
        }
      ]
    }
  },
  {
    data_setValue: {
      name: 'component/items',
      value: {
        id: 'action-card',
        isTemplate: true,
        groupId: { $ref: 0 }
      }
    }
  },
  {
    action_getDataValue: {
      name: 'component/children',
      id: {
        action_getActionValue: {
          id: { action_getContextValue: 'groupId' },
          query: 'component-parent-id'
        }
      }
    }
  },
  {
    list_indexOf: {
      items: { $ref: 3 },
      value: {
        action_getActionValue: {
          id: { action_getContextValue: 'groupId' },
          query: 'component-id'
        }
      }
    }
  },
  {
    operator_eval: {
      name: '++',
      values: [{ $ref: 4 }]
    }
  },
  {
    data_setValue: {
      name: 'component/children',
      value: {
        action_getBlockValue: {
          value: { $ref: 2 },
          query: 'id'
        }
      },
      options: {
        id: {
          action_getActionValue: {
            id: { action_getContextValue: 'groupId' },
            query: 'component-parent-id'
          }
        },
        update: {
          method: 'splice',
          startIndex: { $ref: 5 }
        }
      }
    }
  }
])
