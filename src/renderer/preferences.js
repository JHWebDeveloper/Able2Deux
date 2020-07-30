import React from 'react'
import { render } from 'react-dom'
import Preferences from './components/preferences/Preferences.js'
import { initTabbedBrowsing } from './utilities'

initTabbedBrowsing()

render(<Preferences />, document.querySelector('#root'))

window.ABLE2.interop.setContextMenu()
