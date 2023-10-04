import dsData from '@dooksa/ds-plugin-data'
import dssUser from '@dooksa/ds-server-plugin-user'
import dssComponents from '@dooksa/ds-server-plugin-component'
import dssSection from '@dooksa/ds-server-plugin-section'
import dssAction from '@dooksa/ds-server-plugin-action'
import dssTemplate from '@dooksa/ds-server-plugin-template'
import dssLayout from '@dooksa/ds-server-plugin-layout'
import dssEvent from '@dooksa/ds-server-plugin-event'
import dssPage from '@dooksa/ds-server-plugin-page'
import dssWidget from '@dooksa/ds-server-plugin-widget'
import dssContent from '@dooksa/ds-server-plugin-content'
import dssDatabase from '@dooksa/ds-server-plugin-database'
import dssWebServer from '@dooksa/ds-server-plugin-web-server'

const plugins = [
  {
    name: dsData.name,
    version: dsData.version,
    value: dsData
  },
  {
    name: dssDatabase.name,
    version: dssDatabase.version,
    value: dssDatabase
  },
  {
    name: dssWebServer.name,
    version: dssWebServer.version,
    value: dssWebServer
  },
  {
    name: dssContent.name,
    version: dssContent.version,
    value: dssContent
  },
  {
    name: dssPage.name,
    version: dssPage.version,
    value: dssPage
  },
  {
    name: dssEvent.name,
    version: dssEvent.version,
    value: dssEvent
  },
  {
    name: dssLayout.name,
    version: dssLayout.version,
    value: dssLayout
  },
  {
    name: dssTemplate.name,
    version: dssTemplate.version,
    value: dssTemplate
  },
  {
    name: dssAction.name,
    version: dssAction.version,
    value: dssAction
  },
  {
    name: dssWidget.name,
    version: dssWidget.version,
    value: dssWidget
  },
  {
    name: dssSection.name,
    version: dssSection.version,
    value: dssSection
  },
  {
    name: dssComponents.name,
    version: dssComponents.version,
    value: dssComponents
  },
  {
    name: dssUser.name,
    version: dssUser.version,
    value: dssUser
  }
]

export default plugins
