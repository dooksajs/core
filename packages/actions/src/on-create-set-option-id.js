import createAction from '@dooksa/create-action'

export default createAction('on-create-set-option-id', [{
  state_setValue: {
    name: 'component/options',
    value: {
      id: {
        action_getContextValue: 'rootId'
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
