import { createComponent, extendComponent } from '@dooksa/create-component'
import { buttonMixin, eventTypeMouseMixin } from '../mixins/index.js'
import text from '../text/text.js'
import icon from '../icon/icon.js'

const btnText = extendComponent(text, {
  options: { text: 'Button' }
})
const btnIcon = extendComponent(icon, {
  options: { icon: 'material-symbols:info-outline' }
})

export default createComponent({
  id: 'button',
  tag: 'button',
  children: [btnText, btnIcon],
  allowedChildren: [btnText, btnIcon],
  properties: [
    {
      name: 'type',
      value: 'button'
    },
    { name: 'className',
      value: 'btn'
    }
  ]
}, [buttonMixin, eventTypeMouseMixin])
