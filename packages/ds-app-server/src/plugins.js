import {
  dsMiddlewareServer,
  dsWebServer,
  dsDatabaseSever,
  dsContentServer,
  dsPageServer,
  dsEventServer,
  dsLayoutServer,
  dsTemplateServer,
  dsActionServer,
  dsSectionServer,
  dsComponentServer,
  dsUserServer,
  dsWidgetServer
} from '@dooksa/ds-plugins'

const plugins = [

  {
    name: dsMiddlewareServer.name,
    version: dsMiddlewareServer.version,
    value: dsMiddlewareServer
  },
  {
    name: dsWebServer.name,
    version: dsWebServer.version,
    value: dsWebServer
  },
  {
    name: dsDatabaseSever.name,
    version: dsDatabaseSever.version,
    value: dsDatabaseSever
  },
  {
    name: dsContentServer.name,
    version: dsContentServer.version,
    value: dsContentServer
  },
  {
    name: dsPageServer.name,
    version: dsPageServer.version,
    value: dsPageServer
  },
  {
    name: dsEventServer.name,
    version: dsEventServer.version,
    value: dsEventServer
  },
  {
    name: dsLayoutServer.name,
    version: dsLayoutServer.version,
    value: dsLayoutServer
  },
  {
    name: dsTemplateServer.name,
    version: dsTemplateServer.version,
    value: dsTemplateServer
  },
  {
    name: dsActionServer.name,
    version: dsActionServer.version,
    value: dsActionServer
  },
  {
    name: dsSectionServer.name,
    version: dsSectionServer.version,
    value: dsSectionServer
  },
  {
    name: dsComponentServer.name,
    version: dsComponentServer.version,
    value: dsComponentServer
  },
  {
    name: dsUserServer.name,
    version: dsUserServer.version,
    value: dsUserServer
  },
  {
    name: dsWidgetServer.name,
    version: dsWidgetServer.version,
    value: dsWidgetServer
  }
]

export default plugins
