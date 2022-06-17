import React from 'react'
import { createRoot } from 'react-dom/client'

import { initTabbedBrowsing } from 'utilities'

import App from './components/main/App'

initTabbedBrowsing()

createRoot(document.querySelector('#root')).render(<App />)

const { interop } = window.ABLE2

interop.setContextMenu()

window.addEventListener('online', interop.checkForUpdateBackup)
