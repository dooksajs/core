import createAction from '@dooksa/create-action'

export default createAction('action-card-body-label-text', [
  {
    data_setValue: {
      name: 'content/items',
      value: {
        value: {
          variable_getValue: {
            scope: { action_getContextValue: 'groupId' },
            query: 'action-card-body-label-text'
          }
        }
      },
      options: { id: { action_getContextValue: 'contentId' } }
    }
  }
])
