import React, { memo } from 'react'
import { func, number, oneOf, string } from 'prop-types'

import { MEDIA_TYPES } from 'constants'
import { objectsAreEqual } from 'utilities'

import AccordionPanel from '../../form_elements/AccordionPanel'
import TextInputWithTokenInsertion from '../../form_elements/TextInputWithTokenInsertion'
import StartEnd from './StartEnd'
import Split from './Split'

const FileOptions = memo(props => {
	const { id, mediaType, start, end, totalFrames, fps, dispatch } = props

	return (
		<>
			<TextInputWithTokenInsertion
				label="Filename"
				name="filename"
				value={props.filename}
				maxLength={251}
				onChange={props.updateFilename} />
			{mediaType === 'video' || mediaType === 'audio' ? <>
				<StartEnd
					id={id}
					start={start}
					end={end}
					totalFrames={totalFrames}
					fps={fps}
					updateStartEnd={props.updateSelectionFromEvent}
					dispatch={dispatch} />
				<Split
					id={id}
					split={props.split}
					start={start}
					end={end}
					fps={fps}
					duration={props.duration}
					dispatch={dispatch} />
			</> : <></>}
		</>
	)
}, objectsAreEqual)

const FileOptionsPanel = props => (
	<AccordionPanel
		heading="File"
		id="fileOptions"
		className="editor-options auto-rows"
		initOpen>
		<FileOptions {...props} />
	</AccordionPanel>
)

const propTypes = {
	id: string.isRequired,
	mediaType: oneOf(MEDIA_TYPES).isRequired,
	filename: string.isRequired,
	start: number.isRequired,
	end: number.isRequired,
	totalFrames: number.isRequired,
	fps: number.isRequired,
	duration: number.isRequired,
	split: number.isRequired,
	updateFilename: func.isRequired,
	updateSelectionFromEvent: func.isRequired,
	dispatch: func.isRequired
}

FileOptions.propTypes = propTypes
FileOptionsPanel.propTypes = propTypes

export default FileOptionsPanel
