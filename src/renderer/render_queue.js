import React from 'react'
import { createRoot } from 'react-dom/client'

import { initTabbedBrowsing } from 'utilities'

import RenderQueue from './components/render_queue/RenderQueue'

initTabbedBrowsing()

createRoot(document.querySelector('#root')).render(<RenderQueue />)

window.ABLE2.interop.setContextMenu()
