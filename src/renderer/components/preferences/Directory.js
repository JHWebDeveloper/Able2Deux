import React from 'react'
import { bool, func, number, exact, string } from 'prop-types'

import { toggleSaveLocation } from '../../actions'

import {
	updateLocationFieldFromEvent,
	updateLocationField,
	addNewLocation,
	removeLocation,
	moveLocation
} from '../../actions/preferences'

import DirectorySelector from '../form_elements/DirectorySelector'

const Directory = ({ dir, index, dispatch }) => {
	const { checked, label, directory, id } = dir

	return (
		<>
			<input
				type="checkbox"
				checked={checked}
				title="Selected by default"
				onChange={() => dispatch(toggleSaveLocation(id))} />
			<button
				type="button"
				name="add"
				className="app-button symbol"
				title="Add directory"
				onClick={e => dispatch(addNewLocation(index, e))}>add</button>
			<button
				type="button"
				name="delete"
				className="app-button symbol"
				title="Delete directory"
				onClick={() => dispatch(removeLocation(id))}>remove</button>
			<input
				type="text"
				name="label"
				value={label}
				onChange={e => dispatch(updateLocationFieldFromEvent(id, e))}
				aria-labelledby="label" />
			<DirectorySelector
				directory={directory}
				onChange={dir => dispatch(updateLocationField(id, 'directory', dir))} />
			<button
				type="button"
				name="up"
				className="app-button symbol"
				title="Move directory up"
				onClick={() => dispatch(moveLocation(index, -1))}>keyboard_arrow_up</button>
			<button
				type="button"
				name="down"
				className="app-button symbol"
				title="Move directory down"
				onClick={() => dispatch(moveLocation(index))}>keyboard_arrow_down</button>
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
	dispatch: func.isRequired
}

export default Directory
