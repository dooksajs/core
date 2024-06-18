import createAction from '@dooksa/create-action'

export default createAction('on-create-label-text', [{
  set_dataValue: {
    name: 'content/items',
    value: {
      value: {
        get_actionValue: {
          id: {
            get_contextValue: 'rootId'
          },
          query: 'text'
        }
      }
    },
    options: {
      id: {
        get_contextValue: 'contentId'
      }
    }
  }
}])
