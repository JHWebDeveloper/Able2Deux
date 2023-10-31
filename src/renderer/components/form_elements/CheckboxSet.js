import React, { useId, useMemo } from 'react'
import { arrayOf, bool, func, number, shape, string } from 'prop-types'

import { classNameBuilder } from 'utilities'

import FieldsetWrapper from './FieldsetWrapper'
import Checkbox from './Checkbox'

const SelectAllCheckbox = ({
	selectAllLabel = 'Select All',
	options,
	toggleSelectAll,
	switchIcon
}) => {
	// eslint-disable-next-line no-extra-parens
	const allSelected = useMemo(() => (
		options.every(({ checked }) => checked)
	), [options])

	return (
		<Checkbox
			label={selectAllLabel}
			checked={allSelected}
			onChange={toggleSelectAll}
			switchIcon={switchIcon} />
	)
}

const CheckboxSet = ({
	label,
	selectAllLabel,
	className,
	hideLabel,
	horizontal,
	disabled,
	options,
	onChange: onChangeFallback,
	toggleSelectAll,
	selectAllThreshold = 1,
	switchIcon
}) => {
	const setKey = useId()
	const offsetKey = toggleSelectAll ? 0 : 1

	return (
		<FieldsetWrapper
			label={label}
			className={classNameBuilder({
				'radio-set': true,
				[className]: !!className,
				horizontal
			})}
			hideLabel={hideLabel}
			disabled={disabled}>
			<>
				{toggleSelectAll && options.length > selectAllThreshold ? (
					<SelectAllCheckbox
						key={`${setKey}_0`}
						selectAllLabel={selectAllLabel}
						options={options}
						toggleSelectAll={toggleSelectAll}
						switchIcon={switchIcon} />
				) : <></>}
				{options.map(({ hidden, label, component, checked, name, onChange }, i) => {
					const key = `${setKey}_${i + offsetKey}`

					// eslint-disable-next-line no-extra-parens
					return hidden ? (
						<React.Fragment key={key}/>
					) : (
						<Checkbox
							key={key}
							label={label}
							checked={checked}
							name={name}
							onChange={onChange || onChangeFallback}
							component={component}
							switchIcon={switchIcon} />
					)
				})}
			</>
		</FieldsetWrapper>
	)
}

const COMMON_PROP_TYPES = Object.freeze({
	options: arrayOf(shape({
		label: string,
		name: string,
		checked: bool,
		onChange: func
	})),
	switchIcon: bool,
	selectAllLabel: string,
	toggleSelectAll: func
})

SelectAllCheckbox.propTypes = { ...COMMON_PROP_TYPES }

CheckboxSet.propTypes = {
	...COMMON_PROP_TYPES,
	label: string.isRequired,
	onChange: func,
	toggleSelectAll: func,
	selectAllThreshold: number,
	switchIcon: bool,
	horizontal: bool
}

export default CheckboxSet
