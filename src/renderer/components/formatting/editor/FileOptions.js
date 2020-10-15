import React, { memo, useCallback } from 'react'
import { bool, exact, func, number, string } from 'prop-types'

import {
	updateMediaStateFromEvent,
	toggleMediaNestedCheckbox,
	updateMediaNestedState
} from 'actions'

import { compareProps, secondsToTC } from 'utilities'

import DetailsWrapper from '../../form_elements/DetailsWrapper'
import Timecode from '../../form_elements/Timecode'

const startOverEndMsg = 'Start timecode exceeds end timecode. Media will error on export'
const endOverStartMsg = 'End timecode preceeds start timecode. Media will error on export'
const startOverDurationMsg = 'Start timecode exceeds media duration. Media will error on export'
const endZeroMsg = 'End timecode preceeds start timecode. Media will error on export'

const FileOptions = memo(props => {
	const { id, start, end, mediaType, duration, dispatch } = props

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

	const startOverEnd = start.enabled && end.enabled && start.tc >= end.tc
	const startOverDuration = start.enabled && start.tc >= duration
	const endZero = end.enabled && end.tc === 0

	return (
		<DetailsWrapper summary="File" id="file" open>
			<fieldset disabled={props.isBatch && props.batch.name && props.batch.position === 'replace'}>
				<legend>Filename:</legend>
				<input
					type="text"
					name="filename"
					title="Filename"
					className="underline"
					value={props.filename}
					maxLength={251}
					onChange={e => dispatch(updateMediaStateFromEvent(id, e))}
					required />
			</fieldset>
			{mediaType === 'video' || mediaType === 'audio' ? <>
				<Timecode
					label="Start:"
					name="start"
					enabled={start.enabled}
					display={start.display}
					toggleTimecode={toggleStart}
					onChange={updateStart}
					invalid={startOverEnd || startOverDuration}
					title={startOverEnd ? startOverEndMsg : startOverDuration ? startOverDurationMsg : ''} />
				<Timecode
					label="End:"
					name="end"
					enabled={end.enabled}
					display={end.display}
					initDisplay={secondsToTC(duration)}
					toggleTimecode={toggleEnd}
					onChange={updateEnd}
					invalid={startOverEnd || endZero}
					title={startOverEnd ? endOverStartMsg : endZero ? endZeroMsg : ''} />
			</> : <></>}
		</DetailsWrapper>
	)
}, compareProps)

FileOptions.propTypes = {
	id: string.isRequired,
	isBatch: bool.isRequired,
	batch: exact({
		name: string,
		position: string
	}).isRequired,
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
