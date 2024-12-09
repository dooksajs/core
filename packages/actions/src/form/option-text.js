import createAction from '@dooksa/create-action'

export default createAction('option-text', [
  {
    state_setValue: {
      name: 'component/options',
      value: {
        value: {
          variable_getValue: {
            scope: { action_getContextValue: 'groupId' },
            prefixId: { action_getContextValue: 'parentId' },
            query: 'option-text'
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
