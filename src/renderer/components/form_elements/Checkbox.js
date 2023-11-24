import React from 'react'
import { arrayOf, bool, element, func, oneOfType, string } from 'prop-types'

import { classNameBuilder } from 'utilities'

import ToggleSwitch from '../svg/ToggleSwitch'

const CheckboxWrapper = ({ label, className, children, component }) => label ? (
	<label className={classNameBuilder({
		'label-with-input': true,
		[className]: !!className
	})}>
		{children}
		<span>{label}</span>
		{component}
	</label>
) : (
	<span className={className}>
		{children}
		{component}
	</span>
)

const Checkbox = ({
	label,
	name,
	className,
	component,
	checked,
	visibleIcon,
	switchIcon,
	disabled,
	onChange,
	title,
	ariaLabelledby
}) => (
	<CheckboxWrapper
		label={label}
		component={component ? component : <></>}
		className={className}>
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

const sharedPropTypes = {
	label: string,
	component: element,
	className: string
}

CheckboxWrapper.propTypes = {
	...sharedPropTypes,
	children: oneOfType([element, arrayOf(element)]).isRequired
}

Checkbox.propTypes = {
	...sharedPropTypes,
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
