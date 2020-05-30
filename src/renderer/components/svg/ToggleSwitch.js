import React from 'react'
import { bool } from 'prop-types'

const ToggleSwitch = ({ toggle, disabled }) => {
	const disabledColor = disabled ? '#ccc' : '#4c4c4c'

	return (
		<svg width="24" height="12" viewBox="0 0 24 12">
			<path fill={toggle ? disabledColor : 'transparent'} d="M18,0H6C2.688,0,0,2.688,0,6s2.688,6,6,6h12c3.312,0,6-2.688,6-6S21.312,0,18,0z"/>
			<path fill={disabledColor} d="M18,0H6C2.688,0,0,2.688,0,6s2.688,6,6,6h12c3.312,0,6-2.688,6-6S21.312,0,18,0z M18,9.6H6
				C4.008,9.6,2.4,7.992,2.4,6S4.008,2.4,6,2.4h11.995c0.002,0,0.003,0,0.005,0c1.992,0,3.6,1.608,3.6,3.6S19.992,9.6,18,9.6z"/>
			{toggle ? <>
				<circle fill={disabledColor} cx="18" cy="6" r="6"/>
				<circle fill="#eee" cx="18" cy="6" r="3.6"/>
			</> : <>
				<circle fill={disabledColor} cx="6" cy="6" r="6"/>
				<circle fill="#eee" cx="6" cy="6" r="3.6"/>
			</>}
		</svg>
	)
}

ToggleSwitch.propTypes = {
	toggle: bool,
	disabled: bool
}

export default ToggleSwitch
