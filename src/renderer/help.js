import React from 'react'
import { createRoot } from 'react-dom/client'

import { initTabbedBrowsing } from 'utilities'

import Help from './components/help/Help'

initTabbedBrowsing()

createRoot(document.querySelector('#root')).render(<Help />)

window.ABLE2.interop.setContextMenu()
