import createAction from '@dooksa/create-action'

export default createAction('option-value', [
  {
    state_setValue: {
      name: 'component/options',
      value: {
        value: {
          variable_getValue: {
            scope: { action_getContextValue: 'groupId' },
            prefixId: { action_getContextValue: 'id' },
            query: 'option-value'
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
