import React, { useCallback } from 'react'
import { func, number, string } from 'prop-types'

import { updateState, splitMedia } from 'actions'

import TimecodeInputSeconds from '../../form_elements/TimecodeInputSeconds'

const Split = ({ id, split, start, end, fps, dispatch }) => {
	const updateSplitDuration = useCallback(({ value }) => {
		dispatch(updateState({ split: value }))
	}, [id])

	const splitIntoSubclips = useCallback(() => {
		dispatch(splitMedia(id, split * fps, start, end))
	}, [id, split, fps, start, end])

	return (
		<div className="split-grid">
			<label htmlFor="split">Split</label>
			<TimecodeInputSeconds
				name="split"
				id="split"
				value={split}
				min={1}
				max={86399}
				onChange={updateSplitDuration} />
			<button
				type="button"
				title="Split into subclips"
				className="app-button small symbol"
				onClick={splitIntoSubclips}>content_cut</button>
		</div>
	)
}

Split.propTypes = {
	id: string.isRequired,
	split: number.isRequired,
	start: number.isRequired,
	end: number.isRequired,
	fps: number.isRequired,
	dispatch: func.isRequired
}

export default Split
