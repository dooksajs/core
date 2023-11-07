import {
  dsMiddleware,
  dsWebServer,
  dsDatabase,
  dsContent,
  dsPage,
  dsEvent,
  dsLayout,
  dsTemplate,
  dsAction,
  dsSection,
  dsComponent,
  dsUser,
  dsWidget
} from '@dooksa/ds-plugin-server'

const plugins = [

  {
    name: dsMiddleware.name,
    version: dsMiddleware.version,
    value: dsMiddleware
  },
  {
    name: dsWebServer.name,
    version: dsWebServer.version,
    value: dsWebServer
  },
  {
    name: dsDatabase.name,
    version: dsDatabase.version,
    value: dsDatabase
  },
  {
    name: dsContent.name,
    version: dsContent.version,
    value: dsContent
  },
  {
    name: dsPage.name,
    version: dsPage.version,
    value: dsPage
  },
  {
    name: dsEvent.name,
    version: dsEvent.version,
    value: dsEvent
  },
  {
    name: dsLayout.name,
    version: dsLayout.version,
    value: dsLayout
  },
  {
    name: dsTemplate.name,
    version: dsTemplate.version,
    value: dsTemplate
  },
  {
    name: dsAction.name,
    version: dsAction.version,
    value: dsAction
  },
  {
    name: dsSection.name,
    version: dsSection.version,
    value: dsSection
  },
  {
    name: dsComponent.name,
    version: dsComponent.version,
    value: dsComponent
  },
  {
    name: dsUser.name,
    version: dsUser.version,
    value: dsUser
  },
  {
    name: dsWidget.name,
    version: dsWidget.version,
    value: dsWidget
  }
]

export default plugins
