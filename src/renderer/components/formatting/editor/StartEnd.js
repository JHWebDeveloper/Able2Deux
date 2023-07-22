import React, { useCallback } from 'react'
import { func, number, string } from 'prop-types'

import { updateMediaStateById } from 'actions'

import { framesToAudibleTC } from 'utilities'

import TimecodeInputFrames from '../../form_elements/TimecodeInputFrames'
import SliderDouble from '../../form_elements/SliderDouble'

const startStaticProps = { name: 'start', title: 'Start' }
const endStaticProps = { name: 'end', title: 'End' }

const StartEnd = ({ id, start, end, totalFrames, fps, dispatch }) => {
	const updateTimecode = useCallback(({ name, value }) => {
		dispatch(updateMediaStateById(id, { [name]: value }))
	}, [id])

	const shiftTimecodes = useCallback(({ valueL, valueR }) => {
		dispatch(updateMediaStateById(id, {
			start: valueL,
			end: valueR
		}))
	}, [id])

	const onKeyDown = useCallback(e => {
		const props = {}
		
		switch (e.key) {
			case 'd':
				props.start = 0
				break
			case 'g':
				props.start = 0
				// falls through
			case 'f':
				props.end = totalFrames
				break
			case 'q':
				props.timecode = start
				break
			case 'w':
				props.timecode = end - 1
				break
			default:
				return true
		}

		dispatch(updateMediaStateById(id, props))
	}, [id, start, end, totalFrames])

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
		<div className="timecode-slider-grid" onKeyDown={onKeyDown}>
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
				middleThumbTitle="Move Subclip"
				leftThumb={startProps}
				rightThumb={endProps}
				max={totalFrames}
				microStep={1}
				onPan={shiftTimecodes}
				transformValueForAria={val => framesToAudibleTC(val, fps)} />
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
