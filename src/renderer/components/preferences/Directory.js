import React, { useCallback } from 'react'
import { bool, func, number, exact, string } from 'prop-types'

import {
	addNewLocation,
	moveSortableElement,
	removeSortableElement,
	toggleSaveLocation,
	updateSaveLocation
} from 'actions'

import Checkbox from '../form_elements/Checkbox'
import DirectorySelector from '../form_elements/DirectorySelector'
import DragIndicator from '../svg/DragIndicator'

const Directory = ({ dir, index, total, dispatch }) => {
	const { id, hidden, checked, label, directory } = dir

	const title = `Delete ${label}`

	const toggleVisibility = useCallback(() => {
		dispatch(toggleSaveLocation(id, 'hidden'))
	}, [id])

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
		const { name, value } = e?.target || e

		dispatch(updateSaveLocation(id, {
			[name]: value
		}))
	}, [id])

	const updateDirectory = useCallback(dir => {
		dispatch(updateSaveLocation(id, {
			directory: dir
		}))
	}, [id])

	const moveUp = useCallback(() => {
		dispatch(moveSortableElement('saveLocations', index, index - 1))
	}, [index])

	const moveDown = useCallback(() => {
		dispatch(moveSortableElement('saveLocations', index, index + 2))
	}, [index])

	return (
		<>
			<Checkbox
				name="hidden"
				ariaLabelledby="save-locations-hide"
				title={`${hidden ? 'Show' : 'Hide'} ${label}`}
				checked={hidden}
				onChange={toggleVisibility}
				visibleIcon />
			<Checkbox
				name="default"
				ariaLabelledby="save-locations-default"
				title={`Set ${label} to be ${checked ? '' : 'un'} selected by default`}
				checked={checked}
				onChange={toggleDefault} />
			<button
				type="button"
				name="add"
				className="app-button symbol"
				title="Add new directory"
				aria-label="Add new directory"
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
				className="panel-input"
				value={label}
				onChange={updateLocation}
				aria-labelledby="save-locations-label"
				data-no-drag />
			<DirectorySelector
				ariaLabelledby="save-locations-folder"
				directory={directory}
				onChange={updateDirectory} />
			{total > 1 ? <>
				{index > 0 ? (
					<button
						type="button"
						name="directory-up"
						className="app-button symbol"
						title={`Move ${label} up`}
						aria-label={`Move ${label} up`}
						onClick={moveUp}>keyboard_arrow_up</button>
				) : <></>}
				{index < total - 1 ? (
					<button
						type="button"
						name="directory-down"
						className="app-button symbol"
						title={`Move ${label} up`}
						aria-label={`Move ${label} up`}
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
		directory: string,
		hidden: bool,
		id: string,
		label: string
	}).isRequired,
	index: number.isRequired,
	total: number.isRequired,
	dispatch: func.isRequired
}

export default Directory
