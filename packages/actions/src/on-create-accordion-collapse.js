import createAction from '@dooksa/create-action'

export default createAction('on-create-accordion-collapse', [
  {
    set_dataValue: {
      name: 'component/options',
      value: {
        id: {
          get_contextValue: ''
        }
      },
      options: {
        id: {
          get_contextValue: 'rootId'
        },
        merge: true
      }
    }
  },
  {
    bootstrapCollapse_create: {
      id: {
        get_contextValue: 'id'
      },
      collapseId: {
        get_contextValue: 'rootId'
      },
      parentId: {
        get_dataValue: {
          name: 'component/parents',
          query: {
            id: {
              get_contextValue: 'rootId'
            }
          }
        }
      }
    }
  }
])
