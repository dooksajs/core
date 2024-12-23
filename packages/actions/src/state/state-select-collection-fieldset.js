import createAction from '@dooksa/create-action'

export default createAction('state-select-collection-fieldset', [
  {
    variable_setValue: {
      values: [
        {
          id: 'state-select-collection-fieldset',
          value: {
            action_getContextValue: 'id'
          }
        }
      ]
    }
  }
])
