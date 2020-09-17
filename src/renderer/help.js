import React from 'react'
import { render } from 'react-dom'
import Help from './components/help/Help'
import { initTabbedBrowsing } from './utilities'

initTabbedBrowsing()

render(<Help />, document.querySelector('#root'))

window.ABLE2.interop.setContextMenu()
