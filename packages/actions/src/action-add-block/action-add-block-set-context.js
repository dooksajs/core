import createAction from '@dooksa/create-action'

export default createAction('action-add-block-set-context', [
  {
    variable_setValue: {
      scope: { action_getContextValue: 'groupId' },
      values: [
        {
          id: 'component-content-id',
          value: { action_getContextValue: 'contentId' }
        },
        {
          id: 'component-id',
          value: { action_getContextValue: 'id' }
        },
        {
          id: 'component-parent-id',
          value: { action_getContextValue: 'parentId' }
        },
        {
          id: 'component-root-id',
          value: { action_getContextValue: 'rootId' }
        }
      ]
    }
  }
])
