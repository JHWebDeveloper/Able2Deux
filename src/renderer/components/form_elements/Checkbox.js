import React from 'react'
import { arrayOf, bool, element, func, oneOfType, string } from 'prop-types'

import { classNameBuilder } from 'utilities'

import ToggleSwitch from '../svg/ToggleSwitch'

const CheckboxWrapper = ({ label, children, component }) => label ? (
	<label>
		{children}
		<span>{label}</span>
		{component}
	</label>
) : <span>{children}{component}</span>

const Checkbox = ({ label, Component, name, title, checked, visibleIcon, switchIcon, disabled, onChange, ariaLabelledby }) => (
	<CheckboxWrapper
		label={label}
		component={Component ? <Component disabled={!checked} /> : <></>}>
		<input
			type="checkbox"
			name={name}
			className={classNameBuilder({
				visibility: !switchIcon && visibleIcon,
				switch: !visibleIcon && switchIcon
			})}
			checked={checked}
			onChange={onChange}
			disabled={disabled}
			{...title ? { title } : {}}
			{...label ? {} : ariaLabelledby ? { 'aria-labelledby': ariaLabelledby } : title ? { 'aria-label': title } : {}} />
		{switchIcon ? <ToggleSwitch toggle={checked} disabled={disabled} /> : <></>}
	</CheckboxWrapper>
)

CheckboxWrapper.propTypes = {
	label: string,
	component: element,
	children: oneOfType([element, arrayOf(element)]).isRequired
}

Checkbox.propTypes = {
	label: string,
	Component: element,
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
