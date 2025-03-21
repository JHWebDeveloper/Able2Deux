import React from 'react'
import { bool, func, object, string } from 'prop-types'

const ButtonWithIcon = ({ label, icon, name, title, onClick, disabled, autoFocus = false, iconStyle = {} }) => (
	<button
		type="button"
		className="app-button symbol-left"
		name={name}
		title={title ?? label}
		aria-label={title ?? label}
		onClick={onClick}
		disabled={disabled}
		autoFocus={autoFocus}>
		<i style={iconStyle} aria-hidden>{icon}</i>
		{label}
	</button>
)

ButtonWithIcon.propTypes = {
	label: string.isRequired,
	icon: string.isRequired,
	name: string,
	title: string,
	onClick: func.isRequired,
	disabled: bool,
	autoFocus: bool,
	iconStyle: object
}

export default ButtonWithIcon
