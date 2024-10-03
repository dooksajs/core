import createAction from '@dooksa/create-action'

export default createAction('accordion-generate-name', [
  {
    data_generateId: '$null'
  },
  {
    action_setActionValue: {
      id: {
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
