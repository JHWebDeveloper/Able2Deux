import React, { useCallback } from 'react'
import { arrayOf, bool, exact, func, number, oneOfType, string } from 'prop-types'

import CheckboxSet from '../form_elements/CheckboxSet'

const SelectAttributes = ({ presets, updateState }) => {
	const toggleIncludePreset = useCallback((e, checked) => {
		const { name } = e?.target || e

		updateState(currentState => ({
			...currentState,
			presets: currentState.presets.map(item => item.attribute === name ? {
				...item,
				include: checked ?? !item.include
			} : item)
		}))
	}, [])

	const toggleSelectAllPresets = useCallback(e => {
		const { checked } = e?.target || e

		updateState(currentState => ({
			...currentState,
			presets: currentState.presets.map(item => ({ ...item, include: checked }))
		}))
	}, [])

	return (
		<CheckboxSet
			label="Select attributes to include"
			onChange={toggleIncludePreset}
			toggleSelectAll={toggleSelectAllPresets}
			checkboxes={presets.map(({ label, include, attribute }) => ({
				label,
				name: attribute,
				checked: include
			}))} />
	)
}

SelectAttributes.propTypes = {
	presets: arrayOf(exact({
		attribute: string,
		label: string,
		include: bool,
		order: number,
		value: oneOfType([bool, number, string, arrayOf(exact({
			id: string,
			hidden: bool,
			limit: bool,
			x: number,
			y: number
		}))])
	})),
	updateState: func.isRequired
}

export default SelectAttributes
