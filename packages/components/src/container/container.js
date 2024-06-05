import createComponent from '@dooksa/create-component'
import card from '../card/card.js'
import { backgroundMixin, spacingMixin, positionMixin } from '../mixins/index.js'
import text from '../text/text.js'
import button from '../button/button.js'

export default createComponent({
  id: 'container',
  tag: 'div',
  allowedChildren: [card, text, button],
  properties: [
    {
      name: 'className',
      value: 'container'
    }
  ]
}, [backgroundMixin, spacingMixin, positionMixin])
