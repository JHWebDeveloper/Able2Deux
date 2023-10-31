import React, { useCallback } from 'react'
import { arrayOf, bool, exact, func, number, oneOfType, shape, string } from 'prop-types'

import { toggleAllPresetAttributes, toggleIncludePresetAttribute } from 'actions'

import CheckboxSet from '../form_elements/CheckboxSet'

const AttributeSelector = ({ attributes = [], dispatch }) => {
	const dispatchToggleIncludePresetAttribute = useCallback(e => {
		dispatch(toggleIncludePresetAttribute(e.target.name))
	}, [])

	const dispatchToggleAllPresetAttributes = useCallback(e => {
		dispatch(toggleAllPresetAttributes(e.target.checked))
	}, [])

	return (
		<CheckboxSet
			label="Select attributes to include"
			onChange={dispatchToggleIncludePresetAttribute}
			toggleSelectAll={dispatchToggleAllPresetAttributes}
			options={attributes.map(({ label, include, attribute }) => ({
				label,
				name: attribute,
				checked: include
			}))} />
	)
}

AttributeSelector.propTypes = {
	attributes: arrayOf(shape({
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
	dispatch: func.isRequired
}

export default AttributeSelector
