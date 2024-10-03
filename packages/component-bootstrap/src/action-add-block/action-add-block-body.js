import {
  extendAccordionCollapse,
  extendAccordionInner
} from '@dooksa/component-extra'
import actionAddBlockList from './action-add-block-list.js'

const container = extendAccordionInner({ children: [actionAddBlockList] })

export default extendAccordionCollapse({
  metadata: { id: 'action-add-block-body' },
  children: [container]
})
