import React from 'react'
import { arrayOf, bool, element, oneOfType, string } from 'prop-types'

const FieldsetWrapper = ({ label, hideLabel, disabled, children }) => {
	return (
		<fieldset
			className={`radio-set${hideLabel ? ' hide-label' : ''}`}
			disabled={disabled}>
			<legend>{label}<span aria-hidden>:</span></legend>
			{children}
		</fieldset>
	)
}

FieldsetWrapper.propTypes = {
	label: string.isRequired,
	hideLabel: bool,
	disabled: bool,
	children: oneOfType([element, arrayOf(element)]).isRequired
}

export default FieldsetWrapper
