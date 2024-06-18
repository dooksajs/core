import createApp from '@dooksa/create-app'
import { data } from '@dooksa/plugins'
import { editImg, editSectionAddComponent, editSectionInner, editSectionInnerIterate, editSectionModal, editSectionModalItems, editSectionOuter, editSectionOuterIterate, onClickAccordionButton, onCollapseHideAccordionButton, onCollapseShowAccordionButton, onCreateAccordion, onCreateAccordionButton, onCreateAccordionCollapse, onCreateChangeImage, onCreateChangeText, onCreateLabel, onCreateLabelText, onCreateSetOptionId } from '@dooksa/actions'
import {
  $http,
  action,
  metadata,
  database,
  component,
  event,
  middleware,
  page,
  theme,
  user,
  content
} from '@dooksa/server-plugins'

export default createApp({
  plugins: [
    data,
    middleware,
    $http,
    metadata,
    user,
    database,
    content,
    action,
    component,
    event,
    page,
    theme
  ],
  actions: [
    editImg,
    onCreateChangeImage,
    onCreateChangeText,
    editSectionAddComponent,
    editSectionOuter,
    editSectionOuterIterate,
    editSectionInner,
    editSectionInnerIterate,
    editSectionModal,
    editSectionModalItems,
    onCreateLabel,
    onCreateLabelText,
    onCreateAccordionButton,
    onCreateAccordionCollapse,
    onCreateSetOptionId,
    onClickAccordionButton,
    onCreateAccordion,
    onCollapseHideAccordionButton,
    onCollapseShowAccordionButton
  ]
})
