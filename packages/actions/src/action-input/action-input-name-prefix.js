import createAction from '@dooksa/create-action'

export const actionInputNamePrefix = createAction('action-input-name-prefix', [
  {
    data_setValue: {
      name: 'component/options',
      value: {
        name: {
          operator_eval: {
            name: '+',
            values: [
              { action_getContextValue: 'groupId' },
              {
                action_getPayloadValue: 'name'
              }
            ]
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