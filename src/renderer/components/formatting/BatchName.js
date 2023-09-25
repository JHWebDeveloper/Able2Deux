import React, { useCallback } from 'react'
import { func, string, oneOf } from 'prop-types'

import { updateStateFromEvent } from 'actions'

import AccordionPanel from '../form_elements/AccordionPanel'
import RadioSet from '../form_elements/RadioSet'
import FieldsetWrapper from '../form_elements/FieldsetWrapper'

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
				<FieldsetWrapper label="Batch Name">
					<input
						type="text"
						name="batchName"
						className="panel-input"
						value={batchName}
						maxLength={251}
						onChange={updateBatchName}
						placeholder="If none, leave blank" />
				</FieldsetWrapper>
			) : (
				<>
					<FieldsetWrapper label="Prepend to Filename">
						<input
							type="text"
							name="batchNamePrepend"
							className="panel-input"
							value={batchNamePrepend}
							maxLength={251}
							onChange={updateBatchName}
							placeholder="If none, leave blank" />
					</FieldsetWrapper>
					<FieldsetWrapper label="Append to Filename">
						<input
							type="text"
							name="batchNameAppend"
							className="panel-input"
							value={batchNameAppend}
							maxLength={251}
							onChange={updateBatchName}
							placeholder="If none, leave blank" />
					</FieldsetWrapper>
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
