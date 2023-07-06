import React, { useCallback, useMemo } from 'react'
import { bool, func, number, shape, string } from 'prop-types'

import { extractStill, updateMediaState } from 'actions'

import { framesToAudibleTC } from 'utilities'

import SliderSingle from '../../form_elements/SliderSingle'
import TimecodeInputFrames from '../../form_elements/TimecodeInputFrames'

const timecodeStaticProps = { name: 'timecode', min: 0 }

const FrameSelector = ({ focused, isAudio, dispatch }) => {
	const { id, timecode, start, end, fps, totalFrames } = focused

	const [ snapPoints, className ] = useMemo(() => {
		const points = []
		const classes = []

		if (start > 0) {
			points.push(start)
			classes.push('start-visible')
		}

		if (end < totalFrames) {
			points.push(end)
			classes.push('end-visible')
		}

		return [points, classes.join(' ')]
	}, [start, end, totalFrames])

	const updateTimecode = useCallback(({ name, value }) => {
		dispatch(updateMediaState(id, { [name]: value }))
	}, [id])

	const incrementFrameBackward = useCallback(e => {
		dispatch(updateMediaState(id, {
			timecode: Math.max(timecode - (e.shiftKey ? 10 : 1), 0)
		}))
	}, [id, timecode])

	const incrementFrameForward = useCallback(e => {
		dispatch(updateMediaState(id, {
			timecode: Math.min(timecode + (e.shiftKey ? 10 : 1), totalFrames)
		}))
	}, [id, timecode, totalFrames])

	const dispatchExtractStill = useCallback(e => {
		dispatch(extractStill(focused, e))
	}, [focused])

	const timecodeProps = {
		...timecodeStaticProps,
		value: timecode,
		max: totalFrames - 1,
		onChange: updateTimecode
	}

	return (
		<>
			<div className={className}>
				<SliderSingle
					title="Select Frame"
					fineTuneStep={1}
					snapPoints={snapPoints}
					sensitivity={0}
					transformValueForAria={val => framesToAudibleTC(val, fps)}
					{...timecodeProps} />
			</div>
			<div>
				<TimecodeInputFrames
					fps={fps}
					{...timecodeProps} />
				<button
					type="button"
					className="symbol"
					title="Increment 1 Frame Backward (Shift+Click for 10 Frames)"
					aria-label="Increment 1 Frame Backward (Shift+Click for 10 Frames)"
					onClick={incrementFrameBackward}>chevron_left</button>
				<button
					type="button"
					className="symbol"
					title="Increment 1 Frame Forward (Shift+Click for 10 Frames)"
					aria-label="Increment 1 Frame Forward (Shift+Click for 10 Frames)"
					onClick={incrementFrameForward}>chevron_right</button>
				{isAudio ? <></> : (
					<button
						type="button"
						className="symbol"
						title="Create Screengrab"
						aria-label="Create Screengrab"
						onClick={dispatchExtractStill}>camera_alt</button>
				)}
			</div>
		</>
	)
}

FrameSelector.propTypes = {
	focused: shape({
		id: string.isRequired,
		timecode: number.isRequired,
		start: number.isRequired,
		end: number.isRequired,
		fps: number.isRequired,
		totalFrames: number.isRequired
	}).isRequired,
	isAudio: bool.isRequired,
	dispatch: func.isRequired
}

export default FrameSelector
