import createAction from '@dooksa/create-action'

export default createAction('on-collapse-show-accordion-button', [
  {
    set_dataValue: {
      name: 'component/options',
      value: {
        collapsed: false,
        ariaExpanded: 'true'
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
