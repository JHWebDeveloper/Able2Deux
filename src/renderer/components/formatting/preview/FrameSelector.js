import React, { useCallback, useEffect } from 'react'
import { func, number, shape, string } from 'prop-types'

import { updateMediaState, extractStill } from 'actions'
import { framesToTC } from 'utilities'

import SliderSingle from '../../form_elements/SliderSingle'

const FrameSelector = ({ selected, dispatch }) => {
	const { id, timecode, start, end, fps } = selected

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

	useEffect(() => {
		if (timecode < start) {
			dispatch(updateMediaState(id, { timecode: start }))
		} else if (timecode > end) {
			dispatch(updateMediaState(id, { timecode: end }))
		}
	}, [id, start, end])

	return <>
		<span className="monospace">{framesToTC(timecode, fps)}</span>
		<SliderSingle
			name="timecode"
			title="Select Frame"
			value={timecode}
			min={start}
			max={end}
			fineTuneStep={1}
			onChange={updateTimecode} />
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
	</>
}

FrameSelector.propTypes = {
	selected: shape({
		id: string.isRequired,
		timecode: number.isRequired,
		start: number.isRequired,
		end: number.isRequired,
		fps: number.isRequired
	}).isRequired,
	dispatch: func.isRequired
}

export default FrameSelector
