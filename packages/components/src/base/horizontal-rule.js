import { createComponent } from '@dooksa/create-component'
import { spacingMixin, displayMixin, flexMixin } from '../mixins/index.js'

export default createComponent({
  id: 'horizontal-rule',
  tag: 'hr'
}, [spacingMixin, flexMixin, displayMixin])
