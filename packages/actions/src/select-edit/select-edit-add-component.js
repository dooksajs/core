import createAction from '@dooksa/create-action'

export default createAction('select-edit-add-component', [
  {
    state_setValue: {
      name: 'component/children',
      value: {
        variable_getValue: {
          scope: {
            action_getContextValue: 'id'
          },
          query: 'componentId'
        }
      },
      options: {
        id: {
          action_getContextValue: 'id'
        },
        update: {
          method: 'push'
        }
      }
    }
  }
])
