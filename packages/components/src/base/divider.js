import { createComponent } from '@dooksa/create-component'
import { backgroundMixin, buttonMixin, displayMixin, flexMixin, insetMixin, levelMixin, positionMixin, spacingMixin, translateMixin } from '../mixins/index.js'

export default createComponent({
  id: 'divider',
  tag: 'div'
}, [backgroundMixin, positionMixin, spacingMixin, levelMixin, insetMixin, translateMixin, buttonMixin, displayMixin, flexMixin])
