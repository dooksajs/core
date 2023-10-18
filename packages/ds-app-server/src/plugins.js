import dsError from '@dooksa/ds-plugin-error'
import dsData from '@dooksa/ds-plugin-data'
import dsUser from '@dooksa/ds-server-plugin-user'
import dsComponents from '@dooksa/ds-server-plugin-component'
import dsSection from '@dooksa/ds-server-plugin-section'
import dsAction from '@dooksa/ds-server-plugin-action'
import dsTemplate from '@dooksa/ds-server-plugin-template'
import dsLayout from '@dooksa/ds-server-plugin-layout'
import dsEvent from '@dooksa/ds-server-plugin-event'
import dsPage from '@dooksa/ds-server-plugin-page'
import dsWebServer from '@dooksa/ds-server-plugin-web-server'
import dsWidget from '@dooksa/ds-server-plugin-widget'
import dsContent from '@dooksa/ds-server-plugin-content'
import dsDatabase from '@dooksa/ds-server-plugin-database'
import dsMiddleware from '@dooksa/ds-server-plugin-middleware'

const plugins = [
  {
    name: dsError.name,
    version: dsError.version,
    value: dsError
  },
  {
    name: dsData.name,
    version: dsData.version,
    value: dsData
  },
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
    name: dsComponents.name,
    version: dsComponents.version,
    value: dsComponents
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
