import createAction from '@dooksa/create-action'

export default createAction('action-card-plugin-icon', [
  {
    action_getActionValue: {
      id: { action_getContextValue: 'groupId' },
      query: 'metadata'
    }
  },
  {
    data_getValue: {
      id: { $ref: 0 },
      name: 'metadata/actions'
    }
  },
  {
    data_getValue: {
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
    data_setValue: {
      name: 'content/items',
      value: {
        value: {
          action_getBlockValue: {
            query: 'item.icon',
            value: { $ref: 2 }
          }
        }
      },
      options: { id: { action_getContextValue: 'contentId' } }
    }
  }
])
