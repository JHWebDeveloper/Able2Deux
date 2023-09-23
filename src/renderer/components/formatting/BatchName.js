import React, { useCallback } from 'react'
import { func, string, oneOf } from 'prop-types'

import { updateStateFromEvent } from 'actions'

import AccordionPanel from '../form_elements/AccordionPanel'
import RadioSet from '../form_elements/RadioSet'

const BATCH_NAME_TYPE_BUTTONS = Object.freeze([
	{
		label: 'Replace Filename',
		value: 'replace'
	},
	{
		label: 'Prepend/Append',
		value: 'prepend_append'
	}
])

const BatchName = ({ batchNameType, batchName, batchNamePrepend, batchNameAppend, dispatch }) => {
	const updateBatchName = useCallback(e => {
		dispatch(updateStateFromEvent(e))
	}, [])

	return (
		<>
			<RadioSet
				label="Template Type"
				name="batchNameType"
				state={batchNameType}
				onChange={updateBatchName}
				buttons={BATCH_NAME_TYPE_BUTTONS} />
			{batchNameType === 'replace' ? (
				<fieldset>
					<legend>Batch Name<span aria-hidden>:</span></legend>
					<input
						type="text"
						name="batchName"
						className="panel-input"
						value={batchName}
						maxLength={251}
						onChange={updateBatchName}
						placeholder="If none, leave blank" />
				</fieldset>
			) : (
				<>
					<fieldset>
						<legend>Prepend to Filename<span aria-hidden>:</span></legend>
						<input
							type="text"
							name="batchNamePrepend"
							className="panel-input"
							value={batchNamePrepend}
							maxLength={251}
							onChange={updateBatchName}
							placeholder="If none, leave blank" />
					</fieldset>
					<fieldset>
						<legend>Append to Filename<span aria-hidden>:</span></legend>
						<input
							type="text"
							name="batchNameAppend"
							className="panel-input"
							value={batchNameAppend}
							maxLength={251}
							onChange={updateBatchName}
							placeholder="If none, leave blank" />
					</fieldset>
				</>
			)}
		</>
	)
}

const BatchNamePanel = props => (
	<AccordionPanel
		heading="Batch Name Template"
		id="batchName"
		className="editor-options auto-rows">
		<BatchName {...props} />
	</AccordionPanel>
)

BatchName.propTypes = {
	batchNameType: oneOf(['replace', 'prepend_append']),
	batchName: string,
	batchNamePrepend: string,
	batchNameAppend: string,
	dispatch: func.isRequired
}

export default BatchNamePanel
