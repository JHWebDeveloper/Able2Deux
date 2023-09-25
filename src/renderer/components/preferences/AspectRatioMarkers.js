import React, { useEffect, useCallback } from 'react'
import { arrayOf, bool, exact, func, number, object, string } from 'prop-types'

import {
	addNewAspectRatioMarker,
	enableAspectRatioMarker,
	moveSortableElement,
	removeSortableElement,
	updateAspectRatioMarker
} from 'actions'

import FieldsetWrapper from '../form_elements/FieldsetWrapper'
import DraggableList from '../form_elements/DraggableList'
import Checkbox from '../form_elements/Checkbox'
import NumberInput from '../form_elements/NumberInput'
import DragIndicator from '../svg/DragIndicator'

const AspectRatioMarker = ({ marker, index, total, dispatch }) => {
	const { id, label, ratio, disabled } = marker

	const title = `Delete ${label} marker`

	const toggleVisibility = useCallback(() => {
		dispatch(enableAspectRatioMarker(id))
	}, [])

	const updateLabel = useCallback(e => {
		const { name, value } = e?.target || e

		dispatch(updateAspectRatioMarker(id, {
			[name]: value
		}))
	}, [])

	const updateRatio = useCallback((index, { name, value }) => {
		ratio[index] = value

		dispatch(updateAspectRatioMarker(id, {
			[name]: ratio
		}))
	}, [])

	const add = useCallback(e => {
		dispatch(addNewAspectRatioMarker(index, e))
	}, [index])

	const remove = useCallback(() => {
		dispatch(removeSortableElement(id, 'aspectRatioMarkers'))
	}, [id])

	const moveUp = useCallback(() => {
		dispatch(moveSortableElement('aspectRatioMarkers', index, index - 1))
	}, [index])

	const moveDown = useCallback(() => {
		dispatch(moveSortableElement('aspectRatioMarkers', index, index + 2))
	}, [index])

	return (
		<>
			<Checkbox
				name="disabled"
				title={`${disabled ? 'Show' : 'Hide'} ${label} marker`}
				ariaLabelledby="ar-markers-hide"
				checked={disabled}
				onChange={toggleVisibility}
				visibleIcon />
			<button
				type="button"
				name="add"
				className="app-button symbol"
				title="Add new aspect ratio marker"
				aria-label="Add new aspect ratio marker"
				onClick={add}>add</button>
			<button
				type="button"
				name="delete"
				className="app-button symbol"
				title={title}
				aria-label={title}
				onClick={remove}>remove</button>
			<input
				type="text"
				name="label"
				title="Label"
				className="panel-input"
				maxLength="7"
				aria-labelledby="ar-markers-label"
				value={label}
				onChange={updateLabel} />
			<NumberInput
				name="ratio"
				title="Antecedent"
				ariaLabelledby="ar-markers-ratio"
				value={ratio[0]}
				min={0.0001}
				max={9999}
				defaultValue={1}
				decimalPlaces={4}
				onChange={e => updateRatio(0, e)} />
			<span aria-hidden>:</span>
			<NumberInput
				name="ratio"
				title="Consequent"
				ariaLabelledby="ar-markers-ratio"
				value={ratio[1]}
				min={0.0001}
				max={9999}
				defaultValue={1}
				decimalPlaces={4}
				onChange={e => updateRatio(1, e)} />
			{total > 1 ? <>
				{index > 0 ? (
					<button
						type="button"
						name="marker-up"
						className="app-button symbol"
						title={`Move ${label} marker up`}
						aria-label={`Move ${label} marker up`}
						onClick={moveUp}>keyboard_arrow_up</button>
				) : <></>}
				{index < total - 1 ? (
					<button
						type="button"
						name="marker-down"
						className="app-button symbol"
						title={`Move ${label} marker down`}
						aria-label={`Move ${label} marker down`}
						onClick={moveDown}>keyboard_arrow_down</button>
				) : <></>}
				<DragIndicator />
			</> : <></>}
		</>
	)
}

const AspectRatioMarkers = ({ aspectRatioMarkers, dispatch }) => {
	const sortingAction = useCallback((oldPos, newPos) => {
		dispatch(moveSortableElement('aspectRatioMarkers', oldPos, newPos))
	}, [])

	useEffect(() => {
		if (aspectRatioMarkers.length === 0) {
			dispatch(addNewAspectRatioMarker(0, false))
		}
	}, [aspectRatioMarkers])

	return (
		<FieldsetWrapper
			label="Aspect Ratio Markers"
			className="aspect-ratio-markers">
			<div className="sortable-grid aspect-ratio-markers-grid">
				<label id="ar-markers-hide">Hide</label>
				<label id="ar-markers-label">Label</label>
				<label id="ar-markers-ratio">Ratio</label>
				<DraggableList sortingAction={sortingAction}>
					{aspectRatioMarkers.map((marker, i) => (
						<AspectRatioMarker
							key={marker.id}
							marker={marker}
							index={i}
							total={aspectRatioMarkers.length}
							dispatch={dispatch} />
					))}
				</DraggableList>
			</div>
		</FieldsetWrapper>
	)
}

AspectRatioMarker.propTypes = {
	marker: exact({
		id: string,
		disabled: bool,
		selected: bool,
		label: string,
		ratio: arrayOf(number)
	}).isRequired,
	index: number.isRequired,
	total: number.isRequired,
	dispatch: func.isRequired
}

AspectRatioMarkers.propTypes = {
	aspectRatioMarkers: arrayOf(object),
	dispatch: func.isRequired
}

export default AspectRatioMarkers
