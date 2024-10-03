import createAction from '@dooksa/create-action'

export default createAction('option-text', [
  {
    data_setValue: {
      name: 'content/items',
      value: {
        value: {
          action_getActionValue: {
            id: { action_getContextValue: 'groupId' },
            prefixId: { action_getContextValue: 'parentId' },
            query: 'option-text'
          }
        }
      },
      options: { id: { action_getContextValue: 'contentId' } }
    }
  }
])
