import createAction from '@dooksa/create-action'

export default createAction('on-create-label-text', [{
  state_setValue: {
    name: 'component/options',
    value: {
      value: {
        variable_getValue: {
          scope: {
            action_getContextValue: 'rootId'
          },
          query: 'text'
        }
      }
    },
    options: {
      id: {
        action_getContextValue: 'id'
      },
      merge: true
    }
  }
}])
