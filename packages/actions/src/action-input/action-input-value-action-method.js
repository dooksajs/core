import createAction from '@dooksa/create-action'

export const actionInputValueActionMethod = createAction('action-input-value-action-method', [
  {
    variable_getValue: {
      scope: { action_getContextValue: 'groupId' },
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
    data_setValue: {
      name: 'component/options',
      value: {
        value: {
          action_getBlockValue: {
            query: 'id',
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