import React, { memo, useCallback } from 'react'
import { bool, exact, func, number, string } from 'prop-types'

import {
	updateMediaStateFromEvent,
	toggleMediaNestedCheckbox,
	updateMediaNestedState
} from '../../../actions'

import { compareProps, secondsToTC } from '../../../utilities'

import DetailsWrapper from '../../form_elements/DetailsWrapper'
import Timecode from '../../form_elements/Timecode'

const FileOptions = memo(({ id, batchName, filename, start, end, mediaType, duration, dispatch }) => {
	const toggleStart = useCallback(e => {
		dispatch(toggleMediaNestedCheckbox(id, 'start', e))
	}, [id])

	const toggleEnd = useCallback(e => {
		dispatch(toggleMediaNestedCheckbox(id, 'end', e))
	}, [id])

	const updateStart = useCallback(tc => {
		dispatch(updateMediaNestedState(id, 'start', tc))
	}, [id])

	const updateEnd = useCallback(tc => {
		dispatch(updateMediaNestedState(id, 'end', tc))
	}, [id])

	return (
		<DetailsWrapper summary="File" id="file" open>
			<fieldset disabled={!!batchName}>
				<legend>Filename:</legend>
				<input
					type="text"
					name="filename"
					title="Filename"
					className="underline"
					value={filename}
					maxLength={282}
					onChange={e => dispatch(updateMediaStateFromEvent(id, e))}
					placeholder="Required"
					required />
			</fieldset>
			{mediaType === 'video' ? <>
				<Timecode
					label="Start:"
					name="start"
					enabled={start.enabled}
					display={start.display}
					toggleTimecode={toggleStart}
					onChange={updateStart} />
				<Timecode
					label="End:"
					name="end"
					enabled={end.enabled}
					display={end.display}
					initDisplay={secondsToTC(duration)}
					toggleTimecode={toggleEnd}
					onChange={updateEnd} />
			</> : <></>}
		</DetailsWrapper>
	)
}, compareProps)

FileOptions.propTypes = {
	id: string.isRequired,
	batchName: string.isRequired,
	filename: string.isRequired,
	start: exact({
		enabled: bool,
		tc: number,
		display: string
	}),
	end: exact({
		enabled: bool,
		tc: number,
		display: string
	}),
	mediaType: string.isRequired,
	duration: number,
	editAll: bool,
	dispatch: func.isRequired
}

export default FileOptions
