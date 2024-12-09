import createAction from '@dooksa/create-action'

export const actionCardPluginIcon = createAction('action-card-plugin-icon', [
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
    state_getValue: {
      id: {
        action_getBlockValue: {
          query: 'item.plugin',
          value: { $ref: 1 }
        }
      },
      name: 'metadata/plugins'
    }
  },
  {
    state_setValue: {
      name: 'component/options',
      value: {
        icon: {
          action_getBlockValue: {
            query: 'item.icon',
            value: { $ref: 2 }
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
