import styleToCSS from 'style-object-to-css-string'

import builtInThemes from './builtInThemes'
import { loadPrefs } from '../preferences/preferences'

const cssKeyStore = new Map()

export const loadTheme = async ({ webContents }, cssKeyName)  => {
  let { theme } =  await loadPrefs()

  if (!(theme in builtInThemes)) theme = 'classic'

  const style = builtInThemes[theme]
  const css = `:root{${styleToCSS(style)}}`

  const key = await webContents.insertCSS(css)

  cssKeyStore.set(cssKeyName, key)
}

export const reloadTheme = async (win, cssKeyName) => {
  if (!win) return Promise.resolve()

  const key = cssKeyStore.get(cssKeyName)

  await win.webContents.removeInsertedCSS(key)

  return loadTheme(win, cssKeyName)
}
