import React from 'react'
import { withRouter } from 'react-router-dom'

import { updateStateFromEvent } from '../../actions'
import { toggleSaveLocation } from '../../actions/render'

import Checkbox from '../form_elements/Checkbox'
import RadioSet from '../form_elements/RadioSet'

const SaveOptions = withRouter(({ media, batchName, batchNamePosition, saveLocations, setRendering, dispatch, history }) => {
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
					<RadioSet
						name="batchNamePosition"
						state={batchNamePosition}
						onChange={e => dispatch(updateStateFromEvent(e))}
						buttons={[
							{
								label: 'Overwrite Filename',
								value: 'overwrite'
							},
							{
								label: 'Add to front',
								value: 'prefix'
							},
							{
								label: 'Add to back',
								value: 'suffix'
							}
						]}/>
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
