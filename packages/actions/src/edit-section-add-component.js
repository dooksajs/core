import createAction from '@dooksa/create-action'

export default createAction('edit-section-add-component', [
  {
    set_dataValue: {
      name: 'component/children',
      value: {
        get_actionValue: {
          id: {
            get_contextValue: 'id'
          },
          query: 'componentId'
        }
      },
      options: {
        id: {
          get_contextValue: 'id'
        },
        update: {
          method: 'push'
        }
      }
    }
  }
])
