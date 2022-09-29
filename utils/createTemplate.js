import path from 'path'
import fs from 'fs'
import DsPlugin from '@dooksa/ds-plugin'
import DsManager from '@dooksa/ds-plugin-manager'
import DsDevTool from '@dooksa/ds-plugin-dev-tool'
import DsParse from '@dooksa/ds-plugin-parse'
import modifiers from '../scripts/templates/index.js'
const dsManager = new DsPlugin(DsManager, [])

const dsApp = dsManager.init({
  buildId: 1,
  plugins: [
    {
      name: DsDevTool.name,
      plugin: DsDevTool
    },
    {
      name: DsParse.name,
      plugin: DsParse
    }
  ],
  isDev: true
})

const mergeStrings = (a, b, spacer = ' ') => {
  const set = new Set([...a.split(spacer), ...b.split[spacer]])
  const iterator = set.values()
  let result = ''

  for (const value of iterator) {
    result += value + spacer
  }

  return result.substring(result.length - spacer.length)
}

const mergeComponent = (a, b) => {
  const component = {
    id: b.id ? b.id : a.id
  }

  if (a.attributes || b.attributes) {
    component.attributes = { ...a, ...b }

    if (a.attributes.classList && b.attributes.classList) {
      component.attributes.classList = mergeStrings(a.attributes.classList, b.attributes.classList)
    }
  }

  return component
}

export const importScript = function (script, basePath) {
  return Function(script).call()
}

export const createTemplate = (rootElement) => {
  return dsApp.$method('dsParse/toWidget', { rootElement, isTemplate: true })
}

export const createModifier = (id, index, baseTemplate) => {
  try {
    const sectionId = baseTemplate.metadata.sectionId
    const layoutId = baseTemplate.templates[sectionId].layouts[0]
    const layout = baseTemplate.layouts.items[layoutId]
    const baseComponentId = layout[index].componentId

    if (!baseComponentId) {
      throw new Error(`Modifier Error: Component does not exist (layout:${layoutId} index: ${index})`)
    }

    const baseComponent = baseTemplate.components[baseComponentId]
    const modifierComponents = modifiers[id]
    const result = {
      components: {},
      modifiers: {}
    }

    for (let i = 0; i < modifierComponents.length; i++) {
      const modifierComponent = modifierComponents[i]
      const component = mergeComponent(baseComponent, modifierComponent)
      const componentId = dsApp.$method('dsParse/createHash', component)

      result.components[componentId] = component
      result.modifiers[id] = {
        [index]: componentId
      }
    }
 
    return result
  } catch (e) {
    console.error(e)
  }
}

export const getAllFiles = function (dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath)

  for (let i = 0; i < files.length; i++) {
    const file = files[i]

    if (fs.statSync(dirPath + '/' + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + '/' + file, arrayOfFiles)
    } else {
      arrayOfFiles.push(path.join(dirPath, '/', file))
    }
  }

  return arrayOfFiles
}

export const storeTemplate = async (data, path) => {
  try {
    await fs.writeFileSync(path, data)
  } catch (err) {
    console.error(err)
  }
}

export const camelToKebabCase = str => str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)

export const kebabToCamelCase = str => str.replace(/-./g, x => x[1].toUpperCase())
