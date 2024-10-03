import createAction from '@dooksa/create-action'

export default createAction('option-value', [
  {
    data_setValue: {
      name: 'component/options',
      value: {
        value: {
          action_getActionValue: {
            id: { action_getContextValue: 'groupId' },
            prefixId: { action_getContextValue: 'id' },
            query: 'option-value'
          }
        }
      },
      options: { id: { action_getContextValue: 'id' } }
    }
  }
])
