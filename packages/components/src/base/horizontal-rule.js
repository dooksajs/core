import { createComponent } from '@dooksa/create-component'
import { spacing, displayFlex } from '../mixins/index.js'

export default createComponent({
  id: 'horizontal-rule',
  tag: 'hr'
}, [spacing, displayFlex])
