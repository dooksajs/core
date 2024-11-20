import {
  createOption,
  createSelect,
  createText
} from '@dooksa/components/base'

export default createSelect({
  metadata: { id: 'action-input-data-context' },
  children: [
    createOption({
      children: [
        createText({ options: { value: 'Component Id' } })
      ],
      options: {
        value: 'id'
      }
    }),
    createOption({
      children: [
        createText({ options: { value: 'Group Id' } })
      ],
      options: {
        value: 'groupId'
      }
    }),
    createOption({
      children: [
        createText({ options: { value: 'Parent component Id' } })
      ],
      options: {
        value: 'parentId'
      }
    }),
    createOption({
      children: [
        createText({ options: { value: 'Root component Id' } })
      ],
      options: {
        value: 'rootId'
      }
    })
  ],
  options: {
    name: '.action_getContextValue'
  },
  events: [
    {
      on: 'component/created',
      actionId: 'action-input-name-prefix-action-value'
    },
    {
      on: 'component/created',
      actionId: 'input-id'
    }
  ]
})
