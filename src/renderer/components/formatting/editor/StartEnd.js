import React, { useCallback } from 'react'
import { func, number, string } from 'prop-types'

import { updateMediaState } from 'actions'

import TimecodeInputFrames from '../../form_elements/TimecodeInputFrames'
import SliderDouble from '../../form_elements/SliderDouble'

const startStaticProps = { name: 'start', title: 'Start' }
const endStaticProps = { name: 'end', title: 'End' }

const StartEnd = ({ id, start, end, totalFrames, fps, dispatch }) => {
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
	)
}

StartEnd.propTypes = {
	id: string.isRequired,
	start: number.isRequired,
	end: number.isRequired,
	totalFrames: number.isRequired,
	fps: number.isRequired,
	dispatch: func.isRequired
}

export default StartEnd
