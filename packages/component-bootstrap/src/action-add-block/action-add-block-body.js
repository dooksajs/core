import {
  createAccordionCollapse,
  createAccordionInner
} from '@dooksa/component-extra'
import actionAddBlockList from './action-add-block-list.js'

const container = createAccordionInner({ children: [actionAddBlockList] })

export default createAccordionCollapse({
  metadata: { id: 'action-add-block-body' },
  children: [container]
})
