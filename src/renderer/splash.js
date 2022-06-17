import React from 'react'
import { createRoot } from 'react-dom/client'

import Splash from './components/main/Splash'

createRoot(document.querySelector('#root')).render(<Splash />)

window.ABLE2.interop.setContextMenu()
