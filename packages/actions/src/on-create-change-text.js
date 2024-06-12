import createAction from '@dooksa/create-action'

export default createAction('on-create-change-text', [{
  set_dataValue: {
    name: 'content/items',
    value: {
      value: 'Hello world!'
    },
    options: {
      id: {
        get_contextValue: 'contentId'
      }
    }
  }
}])
