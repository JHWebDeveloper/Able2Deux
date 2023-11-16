import React, { useCallback } from 'react'
import { arrayOf, element, func, number, oneOfType } from 'prop-types'

import { updateState } from 'actions'
import { RATIO_9_16 } from 'constants'

import {
	clamp,
	debounce,
	throttle,
	toPx
} from 'utilities'

const { interop } = window.ABLE2

const PreviewViewport = ({ applyDimensions, previewHeight, dispatch, children }) => {
	const updatePreviewHeight = useCallback(height => {
		dispatch(updateState({ previewHeight: height }))
	}, [])

	const onMouseDown = useCallback(e => {
		const viewPort = e.target.previousElementSibling
		const { top, width } = viewPort.getBoundingClientRect()
		const maxHeight = RATIO_9_16 * width

		const resizePreviewWindow = throttle(e => {
			updatePreviewHeight(clamp(e.clientY - top, 216, maxHeight))
		}, 30)

		const renderPreviewOnResize = debounce(applyDimensions, 500)

		const onMouseUp = () => {
			interop.saveWorkspaceState({
				previewHeight: viewPort.clientHeight
			})

			document.body.style.removeProperty('cursor')

			window.removeEventListener('mousemove', resizePreviewWindow)
			window.removeEventListener('mousemove', renderPreviewOnResize)
			window.removeEventListener('mouseup', onMouseUp)
			window.removeEventListener('contextmenu', onMouseUp)
		}

		document.body.style.cursor = 'row-resize'

		window.addEventListener('mousemove', resizePreviewWindow)
		window.addEventListener('mousemove', renderPreviewOnResize)
		window.addEventListener('mouseup', onMouseUp)
		window.addEventListener('contextmenu', onMouseUp)
	}, [applyDimensions])

	return (
		<div id="preview-viewport">
			<div style={{ height: toPx(previewHeight) }}>
				{children}
			</div>
			<span onMouseDown={onMouseDown} tabIndex="0">
				<span aria-hidden>drag_handle</span>
			</span>
		</div>
	)
}

PreviewViewport.propTypes = {
	applyDimensions: func.isRequired,
	previewHeight: number.isRequired,
	dispatch: func.isRequired,
	children: oneOfType([element, arrayOf(element)]).isRequired
}

export default PreviewViewport
