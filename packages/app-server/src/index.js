import createApp from '@dooksa/create-app'
import { data } from '@dooksa/plugins'
import { editSectionAddComponent, editSectionInner, editSectionInnerIterate, editSectionModal, editSectionOuter, editSectionOuterIterate, onCreateChangeImage, onCreateChangeText } from '@dooksa/actions'
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
    onCreateChangeImage,
    onCreateChangeText,
    editSectionAddComponent,
    editSectionOuter,
    editSectionOuterIterate,
    editSectionInner,
    editSectionInnerIterate,
    editSectionModal
  ]
})
