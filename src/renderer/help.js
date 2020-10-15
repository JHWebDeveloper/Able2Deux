import React from 'react'
import { render } from 'react-dom'

import { initTabbedBrowsing } from 'utilities'

import Help from './components/help/Help'

initTabbedBrowsing()

render(<Help />, document.querySelector('#root'))

window.ABLE2.interop.setContextMenu()
