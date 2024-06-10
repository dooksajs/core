import {
  addComponentButton,
  anchor,
  button,
  buttonGroup,
  card,
  cardBody,
  cardImg,
  cardTitle,
  container,
  div,
  editSectionInner,
  editSectionInnerLink,
  editSectionOuter,
  editSectionOuterLink,
  h1,
  h2,
  h5,
  hr,
  icon,
  span,
  modal,
  modalBody,
  modalContent,
  modalDialog,
  modalFooter,
  modalHeader,
  modalSectionEdit,
  modalSectionEditItem,
  modalTitle,
  text
} from '@dooksa/components'
import createApp from '@dooksa/create-app'
import {
  $fetch,
  action,
  component,
  content,
  data,
  event,
  list,
  metadata,
  operator,
  page,
  query,
  route,
  token
} from '@dooksa/plugins'

export default createApp({
  plugins: [
    data,
    action,
    content,
    component,
    event,
    $fetch,
    list,
    metadata,
    operator,
    route,
    token,
    query,
    page
  ],
  components: [
    addComponentButton,
    anchor,
    button,
    buttonGroup,
    span,
    card,
    cardBody,
    cardImg,
    cardTitle,
    container,
    div,
    editSectionInner,
    editSectionInnerLink,
    editSectionOuter,
    editSectionOuterLink,
    h1,
    h2,
    h5,
    hr,
    icon,
    modal,
    modalBody,
    modalContent,
    modalDialog,
    modalFooter,
    modalHeader,
    modalSectionEdit,
    modalSectionEditItem,
    modalTitle,
    text
  ]
})
