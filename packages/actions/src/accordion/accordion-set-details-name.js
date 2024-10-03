import createAction from '@dooksa/create-action'

export default createAction('accordion-set-details-name', [
  {
    action_getActionValue: {
      id: {
        action_getContextValue: 'groupId'
      },
      query: 'name'
    }
  },
  {
    data_setValue: {
      name: 'component/options',
      value: {
        name: {
          $ref: 0
        }
      },
      options: {
        id: {
          action_getContextValue: 'id'
        },
        merge: true
      }
    }
  }
])
