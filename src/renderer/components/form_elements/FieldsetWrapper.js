import React from 'react'
import { arrayOf, bool, element, oneOfType, string } from 'prop-types'

const FieldsetWrapper = ({ label, className, hideLabel, disabled, children }) => (
	<fieldset
		className={`${className}${hideLabel ? `${className ? ' ' : ''}hide-label` : ''}`}
		disabled={disabled}>
		<legend>{label}<span aria-hidden>:</span></legend>
		{children}
	</fieldset>
)

FieldsetWrapper.propTypes = {
	label: string.isRequired,
	className: string,
	hideLabel: bool,
	disabled: bool,
	children: oneOfType([element, arrayOf(element)]).isRequired
}

export default FieldsetWrapper
