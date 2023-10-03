import React, { useCallback } from 'react'
import { arrayOf, bool, exact, func, number, oneOfType, string } from 'prop-types'

import CheckboxSet from '../form_elements/CheckboxSet'

const AttributeSelector = ({ attributes, updateState }) => {
	const toggleIncludeAttribute = useCallback((e, checked) => {
		const { name } = e?.target || e

		updateState(currentState => ({
			...currentState,
			attributes: currentState.attributes.map(item => item.attribute === name ? {
				...item,
				include: checked ?? !item.include
			} : item)
		}))
	}, [])

	const toggleSelectAllAttributes = useCallback(e => {
		const { checked } = e?.target || e

		updateState(currentState => ({
			...currentState,
			attributes: currentState.attributes.map(item => ({ ...item, include: checked }))
		}))
	}, [])

	return (
		<CheckboxSet
			label="Select attributes to include"
			onChange={toggleIncludeAttribute}
			toggleSelectAll={toggleSelectAllAttributes}
			checkboxes={attributes.map(({ label, include, attribute }) => ({
				label,
				name: attribute,
				checked: include
			}))} />
	)
}

AttributeSelector.propTypes = {
	attributes: arrayOf(exact({
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

export default AttributeSelector
