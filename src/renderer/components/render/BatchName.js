import React from 'react'

import { updateNestedStateFromEvent } from '../../actions'

import RadioSet from '../form_elements/RadioSet'

const BatchName = ({ batch, dispatch }) => {
	return (
		<div id="batch-name">
			<fieldset>
				<legend>Batch Name:</legend>
				<input
					type="text"
					name="name"
					className="underline"
					value={batch.name}
					maxLength={282}
					onChange={e => dispatch(updateNestedStateFromEvent('batch', e))}
					placeholder="If none, leave blank" />
				<RadioSet
					name="position"
					state={batch.position}
					onChange={e => dispatch(updateNestedStateFromEvent('batch', e))}
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
