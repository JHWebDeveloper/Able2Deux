import React from 'react'
import { render } from 'react-dom'

import { initTabbedBrowsing } from 'utilities'

import Preferences from './components/preferences/Preferences.js'

initTabbedBrowsing()

render(<Preferences />, document.querySelector('#root'))

window.ABLE2.interop.setContextMenu()
