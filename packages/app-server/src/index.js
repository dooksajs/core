import { createAppServer } from '@dooksa/create-app'
import clientPlugins, { data } from '@dooksa/plugins'
import { editImg, selectEditInner, selectEditInnerIterate, selectEditOuter, selectEditOuterIterate, onClickAccordionButton, onCollapseHideAccordionButton, onCollapseShowAccordionButton, onCreateAccordion, onCreateAccordionButton, onCreateAccordionCollapse, onCreateChangeImage, onCreateChangeText, labelHtmlFor, onCreateLabelText, onCreateSetOptionId, selectEditAddComponent, selectEditModal, selectEditModalItems, actionEditorAddButton, actionEditorAddButtonCondition, actionEditorAddButtonIterate, inputId, setActionInputId, actionEditorBlockSelectorToggle, actionEditorBlockSelectorAdd, actionEditorBlockSelectorRemove, inputCheckboxContentId, actionEditorAddButtonOff } from '@dooksa/actions'
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
} from '@dooksa/plugins-server'

export default createAppServer({
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
  clientPlugins,
  actions: [
    actionEditorAddButton,
    actionEditorAddButtonCondition,
    actionEditorAddButtonIterate,
    actionEditorAddButtonOff,
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
    labelHtmlFor,
    inputId,
    setActionInputId,
    onCreateLabelText,
    onCreateAccordionButton,
    onCreateAccordionCollapse,
    onCreateSetOptionId,
    onClickAccordionButton,
    onCreateAccordion,
    onCollapseHideAccordionButton,
    onCollapseShowAccordionButton,
    actionEditorBlockSelectorToggle,
    actionEditorBlockSelectorAdd,
    actionEditorBlockSelectorRemove,
    inputCheckboxContentId
  ]
})
