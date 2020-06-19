import React from 'react'
import { render } from 'react-dom'
import Splash from './components/main/Splash'

render(<Splash />, document.querySelector('#root'))

window.ABLE2.interop.setContextMenu()
