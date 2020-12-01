import React, { useCallback } from 'react'
import { bool, func, number, exact, shape, string } from 'prop-types'

import FrameSelector from './FrameSelector'

const toggleTitle = state => state ? 'Hide' : 'Show'

const Controls = props => {
	const { selected, grids, gridColor, dispatch } = props

	const toggleColor = useCallback(gridName => ({
		color: gridName ? gridColor : '#eee'
	}), [gridColor])

	const toggleGrid = useCallback(e => {
		props.toggleGrids({
			...grids,
			[e.target.name]: !grids[e.target.name]
		})
	}, [grids])

	return (
		<>
			{selected.mediaType === 'video' && (
				<FrameSelector
					selected={selected}
					dispatch={dispatch} />
			)}
			<button
				type="button"
				className="symbol"
				name="grid"
				title={`${toggleTitle(grids.grid)} Grid`}
				style={{
					...toggleColor(grids.grid),
					gridColumn: props.enableWidescreenGrids ? 6 : 8
				}}
				onClick={toggleGrid}>grid_on</button>
			{props.enableWidescreenGrids && <>
				<button
					type="button"
					title={`${toggleTitle(grids._239)}  2.39:1 Markers`}
					className="monospace"
					name="_239"
					style={toggleColor(grids._239)}
					onClick={toggleGrid}>
					<span>2.39</span>
				</button>
				<button
					type="button"
					title={`${toggleTitle(grids._185)}  1.85:1 Markers`}
					className="monospace"
					name="_185"
					style={toggleColor(grids._185)}
					onClick={toggleGrid}>
					<span>1.85</span>
				</button>
			</>}
			<button
				type="button"
				title={`${toggleTitle(grids._43)} 4:3 Markers`}
				className="monospace"
				name="_43"
				style={toggleColor(grids._43)}
				onClick={toggleGrid}>
				<span>4:3</span>
			</button>
			<button
				type="button"
				title={`${toggleTitle(grids._11)}  1:1 Markers`}
				className="monospace"
				name="_11"
				style={toggleColor(grids._11)}
				onClick={toggleGrid}>
				<span>1:1</span>
			</button>
			<button
				type="button"
				title={`${toggleTitle(grids._916)}  9:16 Markers`}
				className="monospace"
				name="_916"
				style={toggleColor(grids._916)}
				onClick={toggleGrid}>
				<span>9:16</span>
			</button>
		</>
	)
}

Controls.propTypes = {
	selected: shape({
		id: string,
		mediaType: string,
		timecode: number,
		start: number,
		end: number,
		fps: number,
		duration: number,
		totalFrames: number
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
