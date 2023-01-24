import React, { useCallback } from 'react'
import { bool, exact, func, number, oneOf, string } from 'prop-types'

import { updateMediaStateFromEvent } from 'actions'

import AccordionPanel from '../../form_elements/AccordionPanel'
import StartEnd from './StartEnd'
import Split from './Split'

const FileOptions = props => {
	const { id, batch, mediaType, start, end, totalFrames, fps, split, dispatch } = props

	const updateFilename = useCallback(e => {
		dispatch(updateMediaStateFromEvent(id, e))
	}, [id])

	return (
		<>
			<fieldset disabled={props.isBatch && batch.name && batch.position === 'replace'}>
				<legend>Filename<span aria-hidden>:</span></legend>
				<input
					type="text"
					name="filename"
					title="Filename"
					className="underline"
					value={props.filename}
					maxLength={251}
					onChange={updateFilename} />
			</fieldset>
			{mediaType === 'video' || mediaType === 'audio' ? <>
				<StartEnd
					id={id}
					start={start}
					end={end}
					totalFrames={totalFrames}
					fps={fps}
					dispatch={dispatch} />
				<Split
					id={id}
					split={split}
					start={start}
					end={end}
					fps={fps}
					duration={props.duration}
					dispatch={dispatch} />
			</> : <></>}
		</>
	)
}

const FileOptionsPanel = props => (
	<AccordionPanel
		heading="File"
		id="file"
		className="editor-options auto-rows"
		initOpen>
		<FileOptions {...props} />
	</AccordionPanel>
)

const propTypes = {
	id: string.isRequired,
	mediaType: oneOf(['video', 'image', 'gif', 'audio']),
	isBatch: bool.isRequired,
	batch: exact({
		name: string,
		position: string
	}).isRequired,
	filename: string.isRequired,
	start: number.isRequired,
	end: number.isRequired,
	totalFrames: number.isRequired,
	fps: number.isRequired,
	duration: number.isRequired,
	split: number.isRequired,
	editAll: bool,
	dispatch: func.isRequired
}

FileOptions.propTypes = propTypes
FileOptionsPanel.propTypes = propTypes

export default FileOptionsPanel
