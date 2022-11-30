import React from 'react'
import { bool, func, string } from 'prop-types'

import ToggleSwitch from '../svg/ToggleSwitch'

const Checkbox = ({ label, name, checked, switchIcon, disabled, onChange }) => (
	<label>
		<input
			type="checkbox"
			name={name}
			className={switchIcon ? 'switch' : ''}
			checked={checked}
			onChange={onChange}
			disabled={disabled} />
		{switchIcon ? <ToggleSwitch toggle={checked} disabled={disabled} /> : <></>}
		{!!label ? <span>{label}</span> : <></>}
	</label>
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
