import React from 'react'
import { createRoot } from 'react-dom/client'

import { initTabbedBrowsing } from 'utilities'

import Presets from './components/presets/Presets.js'

initTabbedBrowsing()

createRoot(document.querySelector('#root')).render(<Presets />)

window.ABLE2.interop.setContextMenu()
