import dsData from '@dooksa/ds-plugin-data'
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
    name: dsData.name,
    version: dsData.version,
    value: dsData
  },
  {
    name: dsMetadata.name,
    version: dsMetadata.version,
    value: dsMetadata
  },
  {
    name: dsAction.name,
    version: dsAction.version,
    value: dsAction
  },
  {
    name: dsToken.name,
    version: dsToken.version,
    value: dsToken
  },
  {
    name: dsRouter.name,
    version: dsRouter.version,
    value: dsRouter
  },
  {
    name: dsComponent.name,
    version: dsComponent.version,
    value: dsComponent
  },
  {
    name: dsView.name,
    version: dsView.version,
    value: dsView
  },
  {
    name: dsContent.name,
    version: dsContent.version,
    value: dsContent
  },
  {
    name: dsLayout.name,
    version: dsLayout.version,
    value: dsLayout
  },
  {
    name: dsWidget.name,
    version: dsWidget.version,
    value: dsWidget
  },
  {
    name: dsSection.name,
    version: dsSection.version,
    value: dsSection
  },
  {
    name: dsEvent.name,
    version: dsEvent.version,
    value: dsEvent
  },
  {
    name: dsOperator.name,
    version: dsOperator.version,
    value: dsOperator
  },
  {
    name: dsPage.name,
    version: dsPage.version,
    value: dsPage
  },
  {
    name: dsDatabase.name,
    version: dsDatabase.version,
    value: dsDatabase
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
