import createAction from '@dooksa/create-action'

export default createAction('on-create-label', [{
  set_dataValue: {
    name: 'component/properties',
    value: [
      {
        name: 'htmlFor',
        value: {
          get_actionValue: {
            id: {
              get_contextValue: 'rootId'
            },
            query: 'htmlFor'
          }
        }
      }
    ],
    options: {
      id: {
        get_contextValue: 'id'
      },
      merge: true
    }
  }
}])
