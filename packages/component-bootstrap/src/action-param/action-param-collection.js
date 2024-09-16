import {
  extendText, extendSelectOption, extendSelect
} from '@dooksa/component-base'

const selectOption = extendSelectOption({
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
