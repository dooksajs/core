import createAction from '@dooksa/create-action'

export const actionAddBlockListItemTitle = createAction('action-add-block-list-item-title', [
  {
    variable_getValue: {
      scope: { action_getContextValue: 'groupId' },
      prefixId: { action_getContextValue: 'rootId' },
      query: 'metadata'
    }
  },
  {
    state_getValue: {
      id: { $ref: 0 },
      name: 'metadata/actions'
    }
  },
  {
    state_setValue: {
      name: 'component/options',
      value: {
        value: {
          action_getValue: {
            query: 'item.title',
            value: { $ref: 1 }
          }
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
