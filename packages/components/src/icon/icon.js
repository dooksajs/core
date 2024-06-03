import createComponent from '@dooksa/create-component'

export default createComponent({
  id: 'icon',
  tag: 'iconify-icon',
  component: () => import('iconify-icon'),
  content: [
    {
      name: 'value',
      get: 'icon',
      set: 'icon'
    }
  ],
  properties: [
    {
      name: 'icon',
      value: 'mdi:settings'
    },
    {
      name: 'inline',
      value: 'inline'
    }
  ],
  options: {
    icon: {
      name: 'icon',
      replace: true
    },
    inline: {
      name: 'inline',
      values: {
        on: 'inline',
        off: ''
      }
    }
  },
  styles: [
    {
      name: 'font-size',
      type: 'unit'
    }
  ]
})
