import createAction from '@dooksa/create-action'

export default createAction('accordion-generate-name', [
  {
    state_generateId: '$null'
  },
  {
    variable_setValue: {
      scope: {
        action_getContextValue: 'groupId'
      },
      values: [
        {
          id: 'name',
          value: {
            $ref: 0
          }
        }
      ]
    }
  }
])
