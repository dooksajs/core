import createComponent from '@dooksa/create-component'

export default createComponent({
  id: 'card-img',
  tag: 'img',
  type: 'img',
  properties: [
    {
      name: 'src',
      value: ''
    },
    {
      name: 'className',
      value: 'card-img-top'
    },
    {
      name: 'alt',
      value: ''
    }
  ],
  content: [
    {
      name: 'src',
      propertyName: 'src'
    },
    {
      name: 'alt',
      propertyName: 'alt'
    }
  ],
  options: {
    src: {
      name: 'src'
    },
    position: {
      top: {
        name: 'className',
        value: 'card-img-top'
      },
      bottom: {
        name: 'className',
        value: 'card-img-bottom'
      }
    }
  },
  events: [
    {
      on: 'create',
      actionId: 'on-create-change-image'
    }
  ]
})
