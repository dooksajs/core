import createApp from '@dooksa/create-app'
import { data } from '@dooksa/plugins'
import { editImg, selectEditInner, selectEditInnerIterate, selectEditOuter, selectEditOuterIterate, onClickAccordionButton, onCollapseHideAccordionButton, onCollapseShowAccordionButton, onCreateAccordion, onCreateAccordionButton, onCreateAccordionCollapse, onCreateChangeImage, onCreateChangeText, onCreateLabel, onCreateLabelText, onCreateSetOptionId, selectEditAddComponent, selectEditModal, selectEditModalItems } from '@dooksa/actions'
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
    selectEditAddComponent,
    selectEditOuter,
    selectEditOuterIterate,
    selectEditInner,
    selectEditInnerIterate,
    selectEditModal,
    selectEditModalItems,
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
