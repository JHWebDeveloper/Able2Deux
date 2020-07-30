import React from 'react'
import { render } from 'react-dom'
import App from './components/main/App'
import { initTabbedBrowsing } from './utilities'

initTabbedBrowsing()

render(<App />, document.querySelector('#root'))

const { interop } = window.ABLE2

interop.setContextMenu()

window.addEventListener('online', interop.checkForUpdateBackup)
