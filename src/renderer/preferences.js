import React from 'react'
import { createRoot } from 'react-dom/client'

import { initTabbedBrowsing } from 'utilities'

import Preferences from './components/preferences/Preferences.js'

initTabbedBrowsing()

createRoot(document.querySelector('#root')).render(<Preferences />)

window.ABLE2.interop.setContextMenu()
