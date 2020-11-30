import React, { useCallback, useMemo } from 'react'
import { func, number, shape, string } from 'prop-types'

import { updateMediaState, extractStill } from 'actions'

import SliderSingle from '../../form_elements/SliderSingle'
import TimecodeInputFrames from '../../form_elements/TimecodeInputFrames'

const timecodeStaticProps = { name: 'timecode', min: 0 }

const FrameSelector = ({ selected, dispatch }) => {
	const { id, timecode, start, end, fps, totalFrames } = selected

	const snapPoints = useMemo(() => {
		const sp = []

		if (start > 0) sp.push(start)
		if (end < totalFrames) sp.push(end)

		return sp
	}, [start, end, totalFrames])


	const updateTimecode = useCallback(({ name, value }) => {
		dispatch(updateMediaState(id, { [name]: value }))
	}, [id])

	const incrementFrameBackward = useCallback(e => {
		dispatch(updateMediaState(id, {
			timecode: Math.max(timecode - (e.shiftKey ? 10 : 1), start)
		}))
	}, [id, timecode, start])

	const incrementFrameForward = useCallback(e => {
		dispatch(updateMediaState(id, {
			timecode: Math.min(timecode + (e.shiftKey ? 10 : 1), end)
		}))
	}, [id, timecode, end])

	const dispatchExtractStill = useCallback(e => {
		dispatch(extractStill(selected, e))
	}, [selected])

	const onKeyPress = useCallback(e => {
		const props = {}
		
		switch (e.key) {
			case 'i':
			case 'e':
				props.start = timecode
				break
			case 'o':
			case 'r':
				props.end = timecode + 1
				break
			case 'd':
				props.start = 0
				break
			case 'g':
				props.start = 0
			case 'f':
				props.end = totalFrames
				break
			case 'q':
				props.timecode = start
				break
			case 'w':
				props.timecode = end
				break
			default:
				return true
		}

		dispatch(updateMediaState(id, props))
	}, [id, timecode, start, end, totalFrames])

	const timecodeProps = {
		...timecodeStaticProps,
		value: timecode,
		max: totalFrames,
		onChange: updateTimecode
	}

	return (
		<div onKeyPress={onKeyPress}>
			<TimecodeInputFrames
				fps={fps}
				{...timecodeProps} />
			<SliderSingle
				title="Select Frame"
				fineTuneStep={1}
				snapPoints={snapPoints}
				sensitivity={0}
				{...timecodeProps} />
			<button
				type="button"
				className="symbol"
				title="Increment 1 Frame Backward (Shift+Click for 10 Frames)"
				onClick={incrementFrameBackward}>chevron_left</button>
			<button
				type="button"
				className="symbol"
				title="Increment 1 Frame Forward (Shift+Click for 10 Frames)"
				onClick={incrementFrameForward}>chevron_right</button>
			<button
				type="button"
				className="symbol"
				title="Create Screengrab"
				onClick={dispatchExtractStill}>camera_alt</button>
		</div>
	)
}

FrameSelector.propTypes = {
	selected: shape({
		id: string.isRequired,
		timecode: number.isRequired,
		start: number.isRequired,
		end: number.isRequired,
		fps: number.isRequired,
		totalFrames: number.isRequired
	}).isRequired,
	dispatch: func.isRequired
}

export default FrameSelector
