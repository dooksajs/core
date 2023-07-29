import dsMetadata from '@dooksa/ds-plugin-metadata'
import dsAction from '@dooksa/ds-plugin-action'
import dsSection from '@dooksa/ds-plugin-section'
import dsWidget from '@dooksa/ds-plugin-widget'
import dsPage from '@dooksa/ds-plugin-page'
import dsOperator from '@dooksa/ds-plugin-operator'
import dsEvent from '@dooksa/ds-plugin-event'
import dsRouter from '@dooksa/ds-plugin-router'
import dsComponent from '@dooksa/ds-plugin-component'
import dsLayout from '@dooksa/ds-plugin-layout'
import dsToken from '@dooksa/ds-plugin-token'
import dsView from '@dooksa/ds-plugin-view'
import dsContent from '@dooksa/ds-plugin-content'
import dsDatabase from '@dooksa/ds-plugin-database'

const plugins = [
  {
    name: dsMetadata.name,
    version: dsMetadata.version,
    plugin: dsMetadata
  },
  {
    name: dsAction.name,
    version: dsAction.version,
    plugin: dsAction
  },
  {
    name: dsToken.name,
    version: dsToken.version,
    plugin: dsToken
  },
  {
    name: dsRouter.name,
    version: dsRouter.version,
    plugin: dsRouter
  },
  {
    name: dsComponent.name,
    version: dsComponent.version,
    plugin: dsComponent
  },
  {
    name: dsView.name,
    version: dsView.version,
    plugin: dsView
  },
  {
    name: dsContent.name,
    version: dsContent.version,
    plugin: dsContent
  },
  {
    name: dsLayout.name,
    version: dsLayout.version,
    plugin: dsLayout
  },
  {
    name: dsWidget.name,
    version: dsWidget.version,
    plugin: dsWidget
  },
  {
    name: dsSection.name,
    version: dsSection.version,
    plugin: dsSection
  },
  {
    name: dsEvent.name,
    version: dsEvent.version,
    plugin: dsEvent
  },
  {
    name: dsOperator.name,
    version: dsOperator.version,
    plugin: dsOperator
  },
  {
    name: dsPage.name,
    version: dsPage.version,
    plugin: dsPage
  },
  {
    name: dsDatabase.name,
    version: dsDatabase.version,
    plugin: dsDatabase
  },
  {
    name: 'dsTemplate',
    version: 1,
    options: {
      import: 'ds-plugin-template',
      setupOnRequest: true
    }
  }
]

export default plugins
