import React, { useCallback, useMemo } from 'react'
import { bool, func, number, object, exact, shape, string } from 'prop-types'

import { updateMediaState, updateMediaStateFromEvent, extractStill } from 'actions'
import { secondsToTC, zeroizeAuto } from 'utilities'

const toggleTitle = state => state ? 'Hide' : 'Show'

const Controls = props => {
	const { selected, grids, gridColor, dispatch } = props
	const { id, timecode, start, end, fps } = selected
	const min = useMemo(() => start.enabled ? start.tc * fps : 0, [start])
	const max = useMemo(() => end.enabled ? end.tc * fps : selected.duration * fps, [end])

	const toggleColor = useCallback(gridName => ({
		color: gridName ? gridColor : '#eee'
	}), [gridColor])

	const toggleGrid = useCallback(e => {
		props.toggleGrids({
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

	const dispatchExtractStill = useCallback(() => {
		dispatch(extractStill(selected))
	}, [selected])

	const updateTimecode = useCallback(e => {
		dispatch(updateMediaStateFromEvent(id, e))
	}, [id])

	return (
		<>
			{selected.mediaType === 'video' && <>
				<span className="monospace">
					{secondsToTC(timecode / fps)};{zeroizeAuto(Math.round(timecode % fps), fps)}
				</span>
				<input
					type="range"
					title="Select Frame"
					name="timecode"
					value={timecode}
					min={min}
					max={max}
					onChange={updateTimecode}
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
				<button
					type="button"
					className="symbol"
					title="Create Screengrab"
					onClick={dispatchExtractStill}>camera_alt</button>
			</>}
			<button
				type="button"
				className="symbol"
				name="grid"
				title={`${toggleTitle(grids.grid)} Grid`}
				style={toggleColor(grids.grid)}
				onClick={toggleGrid}>grid_on</button>
			{props.enableWidescreenGrids && <>
				<button
					type="button"
					title={`${toggleTitle(grids._239)}  2.39:1 Markers`}
					className="monospace"
					name="_239"
					style={toggleColor(grids._239)}
					onClick={toggleGrid}>2.39</button>
				<button
					type="button"
					title={`${toggleTitle(grids._185)}  1.85:1 Markers`}
					className="monospace"
					name="_185"
					style={toggleColor(grids._185)}
					onClick={toggleGrid}>1.85</button>
			</>}
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
		</>
	)
}

Controls.propTypes = {
	selected: shape({
		id: string,
		mediaType: string,
		timecode: number,
		start: object,
		end: object,
		fps: number,
		duration: number,
	}).isRequired,
	grids: exact({
		grid: bool,
		_239: bool,
		_185: bool,
		_43: bool,
		_11: bool,
		_916: bool
	}).isRequired,
	gridColor: string.isRequired,
	enableWidescreenGrids: bool.isRequired,
	toggleGrids: func,
	dispatch: func.isRequired
}

export default Controls
