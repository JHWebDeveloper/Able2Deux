import React, { useId, useMemo } from 'react'
import { arrayOf, bool, func, number, shape, string } from 'prop-types'

import { classNameBuilder } from 'utilities'

import FieldsetWrapper from './FieldsetWrapper'
import Checkbox from './Checkbox'

const SelectAllCheckbox = ({
	selectAllLabel = 'Select All',
	checkboxes,
	toggleSelectAll,
	switchIcon
}) => {
	const allSelected = useMemo(() => (
		checkboxes.every(({ checked }) => checked)
	), [checkboxes])

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
	checkboxes,
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
				{toggleSelectAll && checkboxes.length > selectAllThreshold ? (
					<SelectAllCheckbox
						key={`${setKey}_0`}
						selectAllLabel={selectAllLabel}
						checkboxes={checkboxes}
						toggleSelectAll={toggleSelectAll}
						switchIcon={switchIcon} />
				) : <></>}
				{checkboxes.map(({ hidden, label, Component, checked, name, onChange }, i) => {
					const key = `${setKey}_${i + offsetKey}`

					return hidden ? (
						<React.Fragment key={key}/>
					) : (
						<Checkbox
							key={key}
							label={label}
							checked={checked}
							name={name}
							onChange={onChange || onChangeFallback}
							Component={Component}
							switchIcon={switchIcon} />
					)
				})}
			</>
		</FieldsetWrapper>
	)
}

const commonPropTypes = {
	checkboxes: arrayOf(shape({
		label: string,
		name: string,
		checked: bool,
		onChange: func
	})),
	selectAllLabel: string,
	toggleSelectAll: func
}

SelectAllCheckbox.propTypes = commonPropTypes

CheckboxSet.propTypes = {
	...commonPropTypes,
	label: string.isRequired,
	onChange: func,
	toggleSelectAll: func,
	selectAllThreshold: number,
	switchIcon: bool,
	horizontal: bool
}

export default CheckboxSet
