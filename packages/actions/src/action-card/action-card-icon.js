import createAction from '@dooksa/create-action'

export const actionCardIcon = createAction('action-card-icon', [
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
        icon: {
          action_getBlockValue: {
            query: 'item.icon',
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
