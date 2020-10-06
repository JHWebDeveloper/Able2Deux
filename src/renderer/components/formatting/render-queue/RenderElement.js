import React, { useEffect, useMemo, useRef } from 'react'
import { func, exact, number, string } from 'prop-types'

import { COMPLETE } from '../../../status/types'
import { cancelRender } from '../../../actions'
import { capitalize, getStatusColor } from '../../../utilities'

const RenderElement = ({ id, mediaType, filename, exportFilename, render, dispatch }) => {
	const color = useMemo(() => getStatusColor(render.status), [render.status])
	const ref = useRef()

	useEffect(() => {
		if (mediaType !== 'image' && render.percent > 0 && render.percent < 101) {
			ref.current.value = render.percent / 100
		}

		if (render.status === COMPLETE) ref.current.value = 1
	}, [render])
	
	return (
		<div className="media-element">
			<span
				title={capitalize(render.status)}
				style={{ color }}>lens</span>
			<span>
				<span>{exportFilename || filename}</span>
				<span></span>
				<progress
					ref={ref}
					data-status={render.status}></progress>
			</span>
			<button
				type="button"
				className="symbol"
				title="Cancel Render"
				onClick={() => dispatch(cancelRender(id, render.status))}
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
