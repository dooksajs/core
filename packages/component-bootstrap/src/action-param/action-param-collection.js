import {
  extendText, extendOption, extendSelect
} from '@dooksa/component-base'

const selectOption = extendOption({
  children: [
    extendText({
      options: {
        text: 'Select collection'
      }
    })
  ],
  options: {
    selected: true,
    value: ''
  }
})

export default extendSelect({
  metadata: {
    id: 'action-param-collection'
  },
  options: {
    size: 'large'
  },
  children: [selectOption],
  events: [
    {
      on: 'component/mount',
      actionId: 'action-param-collection-options'
    }
  ]
})
