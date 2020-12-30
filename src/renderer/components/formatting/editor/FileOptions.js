import React, { memo, useCallback } from 'react'
import { bool, exact, func, number, oneOf, string } from 'prop-types'

import { updateMediaStateFromEvent } from 'actions'

import { compareProps } from 'utilities'

import StartEnd from './StartEnd'
import Split from './Split'
import DetailsWrapper from '../../form_elements/DetailsWrapper'

const FileOptions = memo(props => {
	const { id, batch, mediaType, start, end, totalFrames, fps, split, dispatch } = props

	const updateFilename = useCallback(e => {
		dispatch(updateMediaStateFromEvent(id, e))
	}, [id])

	return (
		<DetailsWrapper summary="File" id="file" open>
			<fieldset disabled={props.isBatch && batch.name && batch.position === 'replace'}>
				<legend>Filename:</legend>
				<input
					type="text"
					name="filename"
					title="Filename"
					className="underline"
					value={props.filename}
					maxLength={251}
					onChange={updateFilename} />
			</fieldset>
			{(mediaType === 'video' || mediaType === 'audio') && <>
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
			</>}
		</DetailsWrapper>
	)
}, compareProps)

FileOptions.propTypes = {
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

export default FileOptions
