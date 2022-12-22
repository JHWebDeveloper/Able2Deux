import React, { useCallback } from 'react'
import { bool, func, number, exact, string } from 'prop-types'

import {
	toggleSaveLocation,
	updateSaveLocationFromEvent,
	updateSaveLocation,
	addNewLocation,
	removeSortableElement,
	moveSortableElement
} from 'actions'

import Checkbox from '../form_elements/Checkbox'
import DirectorySelector from '../form_elements/DirectorySelector'
import DragIndicator from '../svg/DragIndicator'

const Directory = ({ dir, index, total, dispatch }) => {
	const { checked, label, directory, id } = dir

	const toggleDefault = useCallback(() => {
		dispatch(toggleSaveLocation(id))
	}, [id])

	const add = useCallback(e => {
		dispatch(addNewLocation(index, e))
	}, [index])

	const remove = useCallback(() => {
		dispatch(removeSortableElement(id, 'saveLocations'))
	}, [id])

	const updateLocation = useCallback(e => {
		dispatch(updateSaveLocationFromEvent(id, e))
	}, [id])

	const updateDirectory = useCallback(dir => {
		dispatch(updateSaveLocation(id, 'directory', dir))
	}, [id])

	const moveUp = useCallback(() => {
		dispatch(moveSortableElement('saveLocations', index, index - 1))
	}, [index])

	const moveDown = useCallback(() => {
		dispatch(moveSortableElement('saveLocations', index, index + 2))
	}, [index])

	return (
		<>
			<input
				type="checkbox"
				name="default"
				title={`Set ${label} to be ${disabled ? '' : 'un'} selected by default`}
				aria-labelledby="save-locations-default"
				checked={checked}
				onChange={toggleDefault} />
			<button
				type="button"
				name="add"
				className="app-button symbol"
				title="Add new directory"
				onClick={add}>add</button>
			<button
				type="button"
				name="delete"
				className="app-button symbol"
				title={`Delete ${label}`}
				onClick={remove}>remove</button>
			<input
				type="text"
				name="label"
				className="panel-input"
				value={label}
				onChange={updateLocation}
				aria-labelledby="save-locations-label"
				data-no-drag />
			<DirectorySelector
				directory={directory}
				onChange={updateDirectory}
				ariaLabelledby="save-locations-folder" />
			{total > 1 ? <>
				{index > 0 ? (
					<button
						type="button"
						name="directory-up"
						className="app-button symbol"
						title={`Move ${label} up`}
						onClick={moveUp}>keyboard_arrow_up</button>
				) : <></>}
				{index < total - 1 ? (
					<button
						type="button"
						name="directory-down"
						className="app-button symbol"
						title={`Move ${label} up`}
						onClick={moveDown}>keyboard_arrow_down</button>
				) : <></>}
				<DragIndicator />
			</> : <></>}
		</>
	)
}

Directory.propTypes = {
	dir: exact({
		checked: bool,
		label: string,
		directory: string,
		id: string
	}).isRequired,
	index: number.isRequired,
	total: number.isRequired,
	dispatch: func.isRequired
}

export default Directory
