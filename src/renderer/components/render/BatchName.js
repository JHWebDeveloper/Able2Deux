import React from 'react'

import { updateStateFromEvent } from '../../actions'

import RadioSet from '../form_elements/RadioSet'

const BatchName = ({ batchName, batchNamePosition, dispatch }) => {
	return (
		<div id="batch-name">
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
		</div>
	)
}

export default BatchName
