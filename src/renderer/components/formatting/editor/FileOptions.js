import React, { memo, useCallback } from 'react'
import { bool, exact, func, number, string } from 'prop-types'

import {
	updateMediaState,
	updateMediaStateFromEvent,
} from 'actions'

import { compareProps } from 'utilities'

import DetailsWrapper from '../../form_elements/DetailsWrapper'
import TimecodeInputFrames from '../../form_elements/TimecodeInputFrames'
import SliderDouble from '../../form_elements/SliderDouble'

const startStaticProps = { name: 'start', title: 'Start' }
const endStaticProps = { name: 'end', title: 'End' }

const FileOptions = memo(props => {
	const { id, mediaType, start, end, totalFrames, fps, dispatch } = props

	const updateTimecode = useCallback(({ name, value }) => {
		dispatch(updateMediaState(id, { [name]: value }))
	}, [id])

	const shiftTimecodes = useCallback(({ valueL, valueR }) => {
		dispatch(updateMediaState(id, {
			start: valueL,
			end: valueR
		}))
	}, [id])

	const startProps = {
		...startStaticProps,
		value: start,
		onChange: updateTimecode
	}

	const endProps = {
		...endStaticProps,
		value: end,
		onChange: updateTimecode
	}

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
					onChange={e => dispatch(updateMediaStateFromEvent(id, e))} />
			</fieldset>
			{(mediaType === 'video' || mediaType === 'audio') && (
				<div className="timecode-slider-grid">
					<label htmlFor="start">Start</label>
					<TimecodeInputFrames
						id={startProps.name}
						max={end - 1}
						fps={fps}
						{...startProps} />
					<TimecodeInputFrames
						id={endProps.name}
						min={start + 1}
						max={totalFrames}
						fps={fps}
						{...endProps} />
					<label htmlFor="end">End</label>
					<SliderDouble
						leftThumb={startProps}
						rightThumb={endProps}
						max={totalFrames}
						fineTuneStep={1}
						onPan={shiftTimecodes}
						middleThumbTitle="Move Subclip" />
				</div>
			)}
		</DetailsWrapper>
	)
}, compareProps)

FileOptions.propTypes = {
	id: string.isRequired,
	mediaType: string.isRequired,
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
	editAll: bool,
	dispatch: func.isRequired
}

export default FileOptions
