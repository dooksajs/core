import createAction from '@dooksa/create-action'

export default createAction('on-create-label-text', [{
  set_dataValue: {
    name: 'content/items',
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
        get_contextValue: 'contentId'
      }
    }
  }
}])
