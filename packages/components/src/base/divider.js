import { createComponent } from '@dooksa/create-component'
import { background, position, spacing, level, inset, translate, button } from '../mixins/index.js'

export default createComponent({
  id: 'divider',
  tag: 'div'
}, [background, position, spacing, level, inset, translate, button])
