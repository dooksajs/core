import createAction from '@dooksa/create-action'

export default createAction('action-input-data-action-list', [
  {
    action_ifElse: {
      if: [
        {
          from: {
            variable_getValue: {
              scope: { action_getContextValue: 'groupId' },
              query: 'action-input-data-list-break'
            }
          },
          op: '!'
        }
      ],
      then: [{ $sequenceRef: 1 }, { $sequenceRef: 2 }],
      else: []
    }
  },
  {
    variable_getValue: {
      scope: { action_getContextValue: 'groupId' },
      query: 'action-card-id'
    }
  },
  {
    action_ifElse: {
      if: [
        {
          from: { action_getPayloadValue: 'value' },
          to: { $ref: 1 },
          op: '=='
        }
      ],
      then: [{ $sequenceRef: 3 }],
      else: [{ $sequenceRef: 4 }, { $sequenceRef: 5 }]
    }
  },
  {
    variable_setValue: {
      scope: { action_getContextValue: 'groupId' },
      values: [
        {
          id: 'action-input-data-list-break',
          value: true
        }
      ]
    }
  },
  {
    $id: 'action-metadata',
    variable_getValue: {
      prefixId: { action_getPayloadValue: 'value' },
      query: 'metadata'
    }
  },
  {
    action_ifElse: {
      if: [
        {
          from: { $ref: 4 },
          op: '!!'
        }
      ],
      then: [{ $sequenceRef: 6 }, { $sequenceRef: 7 }],
      else: []
    }
  },
  {
    variable_setValue: {
      scope: { action_getContextValue: 'groupId' },
      values: [
        {
          id: 'action-input-data-list-item',
          value: {
            id: { action_getPayloadValue: 'value' },
            metadata: {
              $ref: 4
            }
          }
        }
      ]
    }
  },
  { // Add edit section link to parent list
    list_push: {
      target: { action_getContextValue: '$list' },
      source: {
        variable_getValue: {
          scope: { action_getContextValue: 'groupId' },
          query: 'action-input-data-list-item'
        }
      }
    }
  }
])
