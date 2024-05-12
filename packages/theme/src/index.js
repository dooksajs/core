import { readdirSync, existsSync, writeFileSync } from 'node:fs'
import { resolve, extname } from 'node:path'
import { tmpdir } from 'node:os'
import sass from 'node-sass'

const themePath = import.meta.dirname
const bootstrapPath = resolve(themePath, 'bootstrap')
const customPath = resolve(themePath, 'custom')

function getStyles (path) {
  const sass = {
    variables: '',
    maps: '',
    custom: ''
  }

  const customFiles = readdirSync(customPath, {
    withFileTypes: true
  })

  // sort sass files
  for (let i = 0; i < customFiles.length; i++) {
    const file = customFiles[i]

    if (file.isFile()) {
      if (file.name === '_variables.scss') {
        sass.variables += `@import "${file.parentPath}/${file.name}";\n`
      } else if (file.name === '_maps.scss') {
        sass.maps += `@import "${file.parentPath}/${file.name}";\n`
      } else if (extname(file.name) === '.scss') {
        sass.custom += `@import "${file.parentPath}/${file.name}";\n`
      }
    }
  }

  if (path && existsSync(path)) {
    const files = readdirSync(path, {
      recursive: true,
      withFileTypes: true
    })

    // sort sass files
    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      if (file.isFile()) {
        if (file.name === '_variables.scss') {
          sass.variables += `@import "${file.parentPath}/${file.name}";`
        } else if (file.name === '_maps.scss') {
          sass.maps += `@import "${file.parentPath}/${file.name}";`
        } else if (extname(file.name) === '.scss') {
          sass.custom += `@import "${file.parentPath}/${file.name}";`
        }
      }
    }
  }

  // create sass import order
  return `@import "${bootstrapPath}/_bootstrap-functions.scss";
    ${sass.variables} 
    @import "${bootstrapPath}/_bootstrap-variables";
    ${sass.maps} 
    @import "${bootstrapPath}/_bootstrap";
    ${sass.custom}`
}

function compileSass (path) {
  const sassString = getStyles(path)
  const result = sass.renderSync({
    data: sassString,
    includePaths: [path, bootstrapPath, customPath]
  })

  return {
    css: result.css.toString()
  }
}

export default compileSass
