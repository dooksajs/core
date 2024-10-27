import createAction from '@dooksa/create-action'

export default createAction('action-add-block-collapse', [
  {
    data_setValue: {
      name: 'content/items',
      value: { open: false },
      options: {
        id: {
          variable_getValue: {
            scope: { action_getContextValue: 'groupId' },
            query: 'component-content-id'
          }
        },
        merge: true
      }
    }
  }
])
