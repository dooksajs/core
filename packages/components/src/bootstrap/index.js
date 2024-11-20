import { selectEditInner, selectEditInnerLink } from './select-edit/select-edit-inner.js'
import { selectEditOuter, selectEditOuterLink } from './select-edit/select-edit-outer.js'
import actionTabs from './action-tab/action-tabs.js'
import actionTabContent from './action-tab/action-tab-content.js'
import actionSelect from './action-select/action-select.js'
import actionEditorAddButton from './action-editor/action-editor-add-button.js'
import actionEditorBlockSelector from './action-editor/action-editor-block-selector.js'
import actionEditorBlockSelectorListAction from './action-editor/action-editor-block-selector-list-action.js'
import actionEditorContainer from './action-editor/action-editor-container.js'

import actionCard from './action-card/action-card.js'
import actionAddBlock from './action-add-block/action-add-block.js'
import actionAddBlockBody from './action-add-block/action-add-block-body.js'
import actionAddBlockListItem from './action-add-block/action-add-block-list-item.js'

// data params
import dataCollectionSelect from './data/data-collection-select.js'
import dataDocumentSelect from './data/data-document-select.js'
import dataSetValueById from './data/data-set-value-by-id.js'
import dataDocumentValueText from './data/data-document-value-text.js'
import dataSelectDocumentById from './data/data-select-document-by-id.js'

// form
import optionVariableValue from './form/option-variable-value.js'
import actionCardBodyLabel from './action-card/action-card-body-label.js'
import actionCardBodyLabelRequired from './action-card/action-card-body-label-required.js'
import actionCardBodyLabelTextRequired from './action-card/action-card-body-label-text-required.js'
// action input

import {
  actionInputArrayItem,
  actionInputArrayItems,
  actionInputDataAction,
  actionInputDataActionLabel,
  actionInputDataActionValue,
  actionInputDataContext,
  actionInputDataContextLabel,
  actionInputDataPropertyLabel,
  actionInputDataString,
  actionInputDataText,
  actionInputDataTextLabel,
  actionInputObject,
  actionInputObjectProperties,
  actionInputObjectProperty,
  actionInputString
} from './action-input/index.js'

export {
  actionAddBlock,
  actionAddBlockBody,
  actionAddBlockListItem,
  actionCardBodyLabel,
  actionCardBodyLabelRequired,
  actionCardBodyLabelTextRequired,
  actionCard,
  // data param
  dataSetValueById,
  dataSelectDocumentById,
  dataCollectionSelect,
  dataDocumentSelect,
  // form
  optionVariableValue,

  actionSelect,
  selectEditInner,
  selectEditInnerLink,
  selectEditOuter,
  selectEditOuterLink,
  actionTabContent,
  actionTabs,
  actionEditorAddButton,
  actionEditorBlockSelector,
  actionEditorContainer,
  actionEditorBlockSelectorListAction
}

export default [
  actionAddBlock,
  actionAddBlockBody,
  actionAddBlockListItem,
  actionCard,
  actionCardBodyLabel,
  actionCardBodyLabelRequired,
  // data param
  dataSetValueById,
  dataSelectDocumentById,
  dataCollectionSelect,
  dataDocumentSelect,
  dataDocumentValueText,

  // form
  optionVariableValue,

  // action input
  actionInputArrayItem,
  actionInputArrayItems,
  actionInputDataAction,
  actionInputDataActionLabel,
  actionInputDataActionValue,
  actionInputDataContext,
  actionInputDataContextLabel,
  actionInputDataPropertyLabel,
  actionInputDataString,
  actionInputDataText,
  actionInputDataTextLabel,
  actionInputObject,
  actionInputObjectProperties,
  actionInputObjectProperty,
  actionInputString,

  actionSelect,
  selectEditInner,
  selectEditInnerLink,
  selectEditOuter,
  selectEditOuterLink,
  actionTabContent,
  actionTabs,
  actionEditorAddButton,
  actionEditorBlockSelector,
  actionEditorContainer,
  actionEditorBlockSelectorListAction
]
