import createAction from '@dooksa/create-action'

export default createAction('edit-section-outer-iterate', [
  { // get component template id
    get_dataValue: {
      name: 'component/items',
      query: {
        id: {
          get_payloadValue: 'value'
        }
      }
    }
  },
  { // Replace current component with 'bootstrap-edit-section-link'
    eval_condition: {
      if: [
        {
          op: '!=',
          from: {
            get_blockValue: {
              value: {
                get_sequenceValue: '0'
              },
              query: 'id'
            }
          },
          to: 'edit-section-outer'
        }
      ],
      then: [2, 3, 4, 5],
      else: [6]
    }
  },
  {
    set_dataValue: {
      name: 'component/items',
      value: {
        id: 'edit-section-outer',
        isTemplate: true
      }
    }
  },
  {
    get_blockValue: {
      value: {
        get_sequenceValue: '2'
      },
      query: 'id'
    }
  },
  {
    set_actionValue: {
      id: {
        get_sequenceValue: '3'
      },
      values: [
        {
          id: 'componentId',
          value: {
            get_payloadValue: 'value'
          }
        }
      ]
    }
  },
  { // Add edit section link to parent list
    list_push: {
      target: {
        get_contextValue: '$list'
      },
      source: {
        get_sequenceValue: '3'
      }
    }
  },
  { // Add edit section link to parent list
    list_push: {
      target: {
        get_contextValue: '$list'
      },
      source: {
        get_payloadValue: 'value'
      }
    }
  }
])
