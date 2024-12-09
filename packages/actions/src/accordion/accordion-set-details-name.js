import createAction from '@dooksa/create-action'

export default createAction('accordion-set-details-name', [
  {
    variable_getValue: {
      scope: {
        action_getContextValue: 'groupId'
      },
      query: 'name'
    }
  },
  {
    state_setValue: {
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
