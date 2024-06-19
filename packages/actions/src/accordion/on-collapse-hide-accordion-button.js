import createAction from '@dooksa/create-action'

export default createAction('on-collapse-hide-accordion-button', [
  {
    set_dataValue: {
      name: 'component/options',
      value: {
        collapsed: true,
        ariaExpanded: 'false'
      },
      options: {
        id: {
          get_actionValue: {
            id: {
              get_contextValue: 'rootId'
            },
            query: 'button'
          }
        }
      }
    }
  }
])
