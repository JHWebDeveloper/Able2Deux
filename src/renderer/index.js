import React from 'react'
import { render } from 'react-dom'

import { initTabbedBrowsing } from 'utilities'

import App from './components/main/App'

initTabbedBrowsing()

render(<App />, document.querySelector('#root'))

const { interop } = window.ABLE2

interop.setContextMenu()

window.addEventListener('online', interop.checkForUpdateBackup)
