import React from 'react'
import { bool } from 'prop-types'

const CaptureModeSwitch = ({ screenshot, disabled }) => (
	<svg className={disabled ? 'toggle-switch-disabled' : ''} width="41px" height="26px" viewBox="0 0 41 26">
		<circle cx="34.263" cy="20.21" r="1.935"/>
		<path d="M32.451,14.167l-1.107,1.209h-1.914c-0.666,0-1.209,0.543-1.209,1.209v7.25
			c0,0.666,0.543,1.209,1.209,1.209h9.668c0.665,0,1.209-0.543,1.209-1.209v-7.25c0-0.666-0.544-1.209-1.209-1.209h-1.915
			l-1.106-1.209H32.451z M34.263,23.231c-1.668,0-3.021-1.354-3.021-3.022c0-1.667,1.354-3.021,3.021-3.021
			c1.667,0,3.021,1.354,3.021,3.021C37.285,21.878,35.93,23.231,34.263,23.231z"/>
		<path d="M28.263,2.377h1.334v1.334h-1.334v5.333h1.334v1.333h-1.334v1.334h12v-1.334h-1.334V9.044h1.334V3.711
			h-1.334V2.377h1.334V1.044h-12V2.377z M37.597,9.044v1.333h-1.334V9.044H37.597z M34.929,9.044v1.333h-1.332V9.044H34.929z
			M32.263,9.044v1.333h-1.334V9.044H32.263z M37.597,2.377v1.334h-1.334V2.377H37.597z M34.929,2.377v1.334h-1.332V2.377H34.929z
			M32.263,2.377v1.334h-1.334V2.377H32.263z"/>
		<path d="M12.096,7.044v12c0,3.312,2.688,6,6,6s6-2.688,6-6v-12c0-3.312-2.688-6-6-6S12.096,3.732,12.096,7.044z"/>
		<circle className="toggle-switch-switch" cx="18.096" cy={screenshot ? 19.045 : 7.043} r="3.601"/>
		<path className="exclude-disabled" d="M8.806,13.544h-3.75c-0.276,0-0.5-0.224-0.5-0.5s0.224-0.5,0.5-0.5h3.75c0.276,0,0.5,0.224,0.5,0.5
			S9.083,13.544,8.806,13.544z"/>
	</svg>
)

CaptureModeSwitch.propTypes = {
	screenshot: bool.isRequired,
	disabled: bool.isRequired
}

export default CaptureModeSwitch
