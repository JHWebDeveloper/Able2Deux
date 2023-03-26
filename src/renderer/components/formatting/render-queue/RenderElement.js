import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { func, exact, number, string } from 'prop-types'

import { COMPLETE } from 'status'
import { cancelRender } from 'actions'
import { capitalize, getStatusColor } from 'utilities'

const RenderElement = ({ id, mediaType, filename, exportFilename, render, dispatch }) => {
	const color = useMemo(() => getStatusColor(render.status), [render.status])
	const progress = useRef(null)
	const title = capitalize(render.status)

	const cancelCurrentRender = useCallback(() => {
		dispatch(cancelRender(id, render.status))
	}, [id, render.status])

	useEffect(() => {
		if (mediaType !== 'image' && render.percent > 0 && render.percent < 101) {
			progress.current.value = render.percent / 100
		}

		if (render.status === COMPLETE) progress.current.value = 1
	}, [render])
	
	return (
		<div className="media-element">
			<span
				title={title}
				aria-label={title}
				style={{ color }}>lens</span>
			<span>
				<input type="text" value={exportFilename || filename} readOnly />
				<span></span>
				<progress
					ref={progress}
					data-status={render.status}></progress>
			</span>
			<button
				type="button"
				className="symbol"
				title="Cancel Render"
				aria-label="Cancel Render"
				onClick={cancelCurrentRender}
				disabled={render.status === COMPLETE}>close</button>
		</div>
	)
}

RenderElement.propTypes = {
	id: string.isRequired,
	mediaType: string.isRequired,
	filename: string.isRequired,
	exportFilename: string,
	render: exact({
		status: string,
		percent: number
	}).isRequired,
	dispatch: func.isRequired
}

export default RenderElement
