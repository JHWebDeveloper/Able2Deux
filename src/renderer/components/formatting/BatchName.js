import React, { useCallback } from 'react'
import { exact, func, string, oneOf } from 'prop-types'

import { updateNestedStateFromEvent } from '../../actions'

import RadioSet from '../form_elements/RadioSet'

const BatchName = ({ batch, dispatch }) => {
	const updateBatchName = useCallback(e => {
		dispatch(updateNestedStateFromEvent('batch', e))
	}, [])

	const updateBatchNamePosition = useCallback(e => {
		dispatch(updateNestedStateFromEvent('batch', e))
	}, [])

	return (
		<div id="batch-name">
			<h2>Batch Name</h2>
			<div>
				<input
					type="text"
					name="name"
					className="underline"
					value={batch.name}
					maxLength={251}
					onChange={updateBatchName}
					placeholder="If none, leave blank" />
				<RadioSet
					name="position"
					state={batch.position}
					onChange={updateBatchNamePosition}
					buttons={[
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
					]}/>
			</div>
		</div>
	)
}

BatchName.propTypes = {
	batch: exact({
		name: string,
		position: oneOf(['replace', 'prepend', 'append'])
	}).isRequired,
	dispatch: func.isRequired
}

export default BatchName
