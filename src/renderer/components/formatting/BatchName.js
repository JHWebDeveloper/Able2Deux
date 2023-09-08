import React, { useCallback } from 'react'
import { func, string, oneOf } from 'prop-types'

import { updateStateFromEvent } from 'actions'

import RadioSet from '../form_elements/RadioSet'

const BATCH_NAME_TYPE_BUTTONS = Object.freeze([
	{
		label: 'Replace',
		value: 'replace'
	},
	{
		label: 'Prepend',
		value: 'prepend'
	},
	{
		label: 'Append',
		value: 'append'
	}
])

const BatchName = ({ batchName, batchNameType, dispatch }) => {
	const updateBatch = useCallback(e => {
		dispatch(updateStateFromEvent(e))
	}, [])

	return (
		<div
			id="batch-name"
			className="formatting-panel">
			<h2>Batch Name</h2>
			<div>
				<input
					type="text"
					name="batchName"
					className="underline"
					value={batchName}
					maxLength={251}
					onChange={updateBatch}
					placeholder="If none, leave blank" />
				<RadioSet
					name="batchNameType"
					state={batchNameType}
					onChange={updateBatch}
					buttons={BATCH_NAME_TYPE_BUTTONS}/>
			</div>
		</div>
	)
}

BatchName.propTypes = {
	batchName: string,
	batchNameType: oneOf(['replace', 'prepend', 'append']),
	dispatch: func.isRequired
}

export default BatchName
