import React from 'react'
import { withRouter } from 'react-router-dom'

import { updateStateFromEvent } from '../../actions'
import { toggleSaveLocation } from '../../actions/render'

import Checkbox from '../form_elements/Checkbox'

const SaveOptions = withRouter(({ media, batchName, saveLocations, setRendering, dispatch, history }) => {
	return <>
		<div id="save-options">
			{media.length > 1 && (
				<fieldset>
					<legend>Batch Name:</legend>
					<input
						type="text"
						name="batchName"
						className="underline"
						value={batchName}
						maxLength={282}
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
		<div>
			<button
				type="button"
				className="app-button"
				title="Back"
				onClick={() => history.push('/')}>Back</button>
			<button
				type="button"
				className="app-button"
				title="Save"
				onClick={() => {
					setRendering(true)
				}}>Save</button>
		</div>
	</>
})

export default SaveOptions
