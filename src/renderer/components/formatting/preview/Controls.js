import React, { useCallback } from 'react'
import { arrayOf, bool, exact, func, object, number, string, oneOf } from 'prop-types'

import { updateMediaState } from 'actions'

import FrameSelector from './FrameSelector'
import GridSelector from './GridSelector'

const Controls = props => {
	const { selected, isAudio, dispatch } = props
	const { id, timecode, start, end, totalFrames } = selected

	const onKeyDown = useCallback(e => {
		const props = {}
		
		switch (e.key) {
			case 'i':
			case 'e':
				if (timecode < end) props.start = timecode
				break
			case 'o':
			case 'r':
				if (timecode >= start) props.end = timecode + 1
				break
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

		dispatch(updateMediaState(id, props))
	}, [id, timecode, start, end, totalFrames])

	return (
		<div id="preview-controls" onKeyDown={onKeyDown}>
			{selected.mediaType === 'video' || isAudio ? (
				<FrameSelector
					selected={selected}
					isAudio={isAudio}
					dispatch={dispatch} />
			) : <></>}
			{isAudio ? <></> : (
				<GridSelector
					previewQuality={props.previewQuality}
					grid={props.grid}
					aspectRatioMarkers={props.aspectRatioMarkers}
					gridColor={props.gridColor}
					setGrid={props.setGrid}
					dispatch={dispatch} />
			)}
		</div>
	)
}

Controls.propTypes = {
	selected: object.isRequired,
	isAudio: bool.isRequired,
	grid: bool.isRequired,
	previewQuality: oneOf([1, 0.75, 0.5]),
	aspectRatioMarkers: arrayOf(exact({
		id: string,
		label: string,
		disabled: bool,
		selected: bool,
		ratio: arrayOf(number)
	})).isRequired,
	gridColor: string.isRequired,
	setGrid: func,
	dispatch: func.isRequired
}

export default Controls
