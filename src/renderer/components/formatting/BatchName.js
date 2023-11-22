import React, { useCallback } from 'react'
import { func, string, oneOf } from 'prop-types'

import { updateState } from 'actions'

import AccordionPanel from '../form_elements/AccordionPanel'
import RadioSet from '../form_elements/RadioSet'
import TextInputWithTokenInsertion from '../form_elements/TextInputWithTokenInsertion'

const BATCH_NAME_TYPE_OPTIONS = Object.freeze([
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
		const { name, value } = e?.target || e

		dispatch(updateState({
			[name]: value
		}))
	}, [])

	return (
		<>
			<RadioSet
				label="Template Type"
				name="batchNameType"
				state={batchNameType}
				onChange={updateBatchName}
				options={BATCH_NAME_TYPE_OPTIONS} />
			{batchNameType === 'replace' ? (
				<TextInputWithTokenInsertion
					label="Batch Name"
					name="batchName"
					value={batchName}
					maxLength={251}
					placeholder="If none, leave blank"
					onChange={updateBatchName} />
			) : (
				<>
					<TextInputWithTokenInsertion
						label="Prepend to Filename"
						name="batchNamePrepend"
						value={batchNamePrepend}
						maxLength={251}
						placeholder="If none, leave blank"
						onChange={updateBatchName} />
					<TextInputWithTokenInsertion
						label="Append to Filename"
						name="batchNameAppend"
						value={batchNameAppend}
						maxLength={251}
						placeholder="If none, leave blank"
						onChange={updateBatchName} />
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
