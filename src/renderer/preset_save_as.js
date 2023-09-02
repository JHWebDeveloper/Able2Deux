import React from 'react'
import { createRoot } from 'react-dom/client'

import { initTabbedBrowsing } from 'utilities'

import PresetSaveAs from './components/presets/PresetSaveAs.js'

initTabbedBrowsing()

createRoot(document.querySelector('#root')).render(<PresetSaveAs />)

window.ABLE2.interop.setContextMenu()
