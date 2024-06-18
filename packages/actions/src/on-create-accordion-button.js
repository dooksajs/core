import createAction from '@dooksa/create-action'

export default createAction('on-create-accordion-button', [
  {
    set_actionValue: {
      id: {
        get_contextValue: 'rootId'
      },
      values: [
        {
          id: 'button',
          value: {
            get_contextValue: 'id'
          }
        }
      ]
    }
  },
  {
    set_dataValue: {
      name: 'component/options',
      value: {
        ariaControls: {
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
  }
])
