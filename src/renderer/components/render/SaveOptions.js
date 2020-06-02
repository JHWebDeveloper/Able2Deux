import React from 'react'
import { withRouter } from 'react-router-dom'

import { updateStateFromEvent } from '../../actions'
import { toggleSaveLocation } from '../../actions/render'

import Checkbox from '../form_elements/Checkbox'

const SaveOptions = withRouter(({ onlyItem, batchName, saveLocations, dispatch, history }) => {
	return <>
		<div id="save-options">
			{!onlyItem && (
				<fieldset>
					<legend>Batch Name:</legend>
					<input
						type="text"
						name="batchName"
						className="underline"
						value={batchName}
						onChange={e => dispatch(updateStateFromEvent(e))}
						placeholder="If none, leave blank" />
				</fieldset>
			)}
			<fieldset>
				<legend>Save Locations:</legend>
				{saveLocations.map(({ id, label, checked }) => (
					<Checkbox
						key={id}
						label={label}
						checked={checked}
						onChange={() => dispatch(toggleSaveLocation(id))} />
				))}
			</fieldset>
		</div>
		<div id="save">
			<button
				type="button"
				className="app-button"
				title="Back"
				onClick={() => history.push('/')}>Back</button>
			<button
				type="button"
				className="app-button"
				title="Save">Save</button>
		</div>
	</>
})

export default SaveOptions
