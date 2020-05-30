import React from 'react'
import { withRouter } from 'react-router-dom'

import { updateStateFromEvent } from '../../actions'
import { toggleSaveLocation } from '../../actions/render'

import Checkbox from '../form_elements/Checkbox'

const SaveOptions = withRouter(({ batchName, saveLocations, dispatch, history }) => {
	return (
		<div id="save-options">
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
			{saveLocations.map(({ id, label, checked }) => (
				<Checkbox
					key={id}
					label={label}
					checked={checked}
					onChange={() => dispatch(toggleSaveLocation(id))} />
			))}
			<div>
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
		</div>
	)
})

export default SaveOptions
