import React, { useCallback, useMemo } from 'react'

import { updateMediaState, updateMediaStateFromEvent } from '../../../actions'
import { secondsToTC, zeroize } from '../../../utilities'

const toggleTitle = state => state ? 'Hide' : 'Show'
const toggleColor = state => ({ color: state ? '#f0f' : '#eee' })

const buttonTitleBackward = 'Increment 1 Frame Backward (Shift+Click for 10 Frames)'
const buttonTitleForward = 'Increment 1 Frame Forward (Shift+Click for 10 Frames)'

const Controls = ({ id, mediaType, timecode, start, end, fps, duration, grids, toggleGrids, dispatch }) => {
	const min = useMemo(() => start.enabled ? start.tc * fps : 0, [start])
	const max = useMemo(() => end.enabled ? end.tc * fps : duration * fps, [end])

	const toggleGrid = useCallback(e => {
		toggleGrids({
			...grids,
			[e.target.name]: !grids[e.target.name]
		})
	}, [grids])

	const incrementFrameBackward = useCallback(e => {
		dispatch(updateMediaState(id, {
			timecode: Math.max(timecode - (e.shiftKey ? 10 : 1), min)
		}))
	}, [id, timecode, start])

	const incrementFrameForward = useCallback(e => {
		dispatch(updateMediaState(id, {
			timecode: Math.min(timecode + (e.shiftKey ? 10 : 1), max)
		}))
	}, [id, timecode, end])

	return (
		<div id="preview-controls">
			{mediaType === 'video' && <>
				<span className="monospace">
					{secondsToTC(timecode / fps)};{zeroize(Math.round(timecode % fps), fps)}
				</span>
				<input
					type="range"
					title="Select Frame"
					name="timecode"
					value={timecode}
					min={min}
					max={max}
					onChange={e => dispatch(updateMediaStateFromEvent(id, e))}
					data-number />
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
			</>}
			<button
				type="button"
				className="symbol"
				name="grid"
				title={`${toggleTitle(grids.grid)} Grid`}
				style={toggleColor(grids.grid)}
				onClick={toggleGrid}>{'grid_on'}</button>
			<button
				type="button"
				title={`${toggleTitle(grids._43)} 4:3 Markers`}
				className="monospace"
				name="_43"
				style={toggleColor(grids._43)}
				onClick={toggleGrid}>4:3</button>
			<button
				type="button"
				title={`${toggleTitle(grids._11)}  1:1 Markers`}
				className="monospace"
				name="_11"
				style={toggleColor(grids._11)}
				onClick={toggleGrid}>1:1</button>
			<button
				type="button"
				title={`${toggleTitle(grids._916)}  9:16 Markers`}
				className="monospace"
				name="_916"
				style={toggleColor(grids._916)}
				onClick={toggleGrid}>9:16</button>
		</div>
	)
}

export default Controls
