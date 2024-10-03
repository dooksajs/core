import createAction from '@dooksa/create-action'

export default createAction('action-card-body-label-icon', [
  {
    data_setValue: {
      name: 'component/options',
      value: {
        icon: {
          action_getActionValue: {
            id: { action_getContextValue: 'groupId' },
            query: 'action-card-body-label-icon'
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
