import React from 'react'
import { render } from 'react-dom'
import Update from './components/main/Update'

render(<Update />, document.querySelector('#root'))

window.ABLE2.interop.setContextMenu()
