import React from 'react'
import { arrayOf, bool, element, oneOfType, string } from 'prop-types'

import { classNameBuilder } from 'utilities'

const FieldsetWrapper = ({ label, className, hideLabel, disabled, children }) => (
	<fieldset
		className={classNameBuilder({
			[className]: className,
			'hide-label': hideLabel
		})}
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
