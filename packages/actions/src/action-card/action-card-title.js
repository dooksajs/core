import createAction from '@dooksa/create-action'

export const actionCardTitle = createAction('action-card-title', [
  {
    variable_getValue: {
      scope: { action_getContextValue: 'groupId' },
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
        id: { action_getContextValue: 'id' },
        merge: true
      }
    }
  }
])
