import createAction from '@dooksa/create-action'

export default createAction('on-click-accordion-button', [
  {
    bootstrapCollapse_toggle: {
      id: {
        get_contextValue: 'rootId'
      }
    }
  }
])
