import React from 'react'
import { bool, func, string } from 'prop-types'

import ToggleSwitch from '../svg/ToggleSwitch'

const CheckboxWrapper = ({ label, children }) => !!label ? (
	<label>
		{children}
		<span>{label}</span>
	</label>
) : (
	<span>{children}</span>
)

const Checkbox = ({ label, name, checked, visibleIcon, switchIcon, disabled, onChange, ariaLabelledby }) => (
	<CheckboxWrapper label={label}>
		<input
			type="checkbox"
			name={name}
			className={visibleIcon ? 'visibility' : switchIcon ? 'switch' : ''}
			checked={checked}
			onChange={onChange}
			disabled={disabled}
			aria-labelledby={ariaLabelledby} />
			{switchIcon ? <ToggleSwitch toggle={checked} disabled={disabled} /> : <></>}
	</CheckboxWrapper>
)

Checkbox.propTypes = {
	label: string,
	name: string,
	checked: bool.isRequired,
	switchIcon: bool,
	disabled: bool,
	onChange: func
}

export default Checkbox
