import createAction from '@dooksa/create-action'

export default createAction('on-create-set-option-id', [{
  set_dataValue: {
    name: 'component/options',
    value: {
      id: {
        get_contextValue: 'rootId'
      }
    },
    options: {
      id: {
        get_contextValue: 'id'
      },
      merge: true
    }
  }
}])
