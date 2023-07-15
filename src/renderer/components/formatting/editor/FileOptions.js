import React, { memo, useCallback } from 'react'
import { bool, func, number, oneOf, string } from 'prop-types'

import { updateMediaStateByIdFromEvent } from 'actions'
import { objectsAreEqual } from 'utilities'

import AccordionPanel from '../../form_elements/AccordionPanel'
import StartEnd from './StartEnd'
import Split from './Split'

const FileOptions = props => {
	const { id, mediaType, start, end, totalFrames, fps, split, dispatch } = props

	const updateFilename = useCallback(e => {
		dispatch(updateMediaStateByIdFromEvent(id, e))
	}, [id])

	return (
		<>
			<fieldset>
				<legend>Filename<span aria-hidden>:</span></legend>
				<input
					type="text"
					name="filename"
					title="Filename"
					aria-label="Filename"
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

const FileOptionsPanel = memo(props => (
	<AccordionPanel
		heading="File"
		id="file"
		className="editor-options auto-rows"
		initOpen>
		<FileOptions {...props} />
	</AccordionPanel>
), objectsAreEqual)

const propTypes = {
	id: string.isRequired,
	mediaType: oneOf(['video', 'image', 'gif', 'audio']),
	multipleItems: bool.isRequired,
	filename: string.isRequired,
	start: number.isRequired,
	end: number.isRequired,
	totalFrames: number.isRequired,
	fps: number.isRequired,
	duration: number.isRequired,
	split: number.isRequired,
	dispatch: func.isRequired
}

FileOptions.propTypes = propTypes
FileOptionsPanel.propTypes = propTypes

export default FileOptionsPanel
