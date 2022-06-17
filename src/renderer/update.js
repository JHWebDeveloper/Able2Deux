import React from 'react'
import { createRoot } from 'react-dom/client'

import Update from './components/main/Update'

createRoot(document.querySelector('#root')).render(<Update />)

window.ABLE2.interop.setContextMenu()
