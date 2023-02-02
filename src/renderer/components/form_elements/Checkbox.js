import React from 'react'
import { arrayOf, bool, element, func, oneOfType, string } from 'prop-types'

import ToggleSwitch from '../svg/ToggleSwitch'

const CheckboxWrapper = ({ label, children }) => label ? (
	<label>
		{children}
		<span>{label}</span>
	</label>
) : <span>{children}</span>

const Checkbox = ({ label, name, title, checked, visibleIcon, switchIcon, disabled, onChange, ariaLabelledby }) => (
	<CheckboxWrapper label={label}>
		<input
			type="checkbox"
			name={name}
			title={title}
			className={visibleIcon ? 'visibility' : switchIcon ? 'switch' : ''}
			checked={checked}
			onChange={onChange}
			disabled={disabled}
			{...label ? {} : ariaLabelledby ? { 'aria-labelledby': ariaLabelledby } : { 'aria-label': title }} />
		{switchIcon ? <ToggleSwitch toggle={checked} disabled={disabled} /> : <></>}
	</CheckboxWrapper>
)

CheckboxWrapper.propTypes = {
	label: string,
	children: oneOfType([element, arrayOf(element)]).isRequired
}

Checkbox.propTypes = {
	label: string,
	name: string,
	title: string,
	checked: bool.isRequired,
	switchIcon: bool,
	visibleIcon: bool,
	disabled: bool,
	onChange: func,
	ariaLabelledby: string
}

export default Checkbox
