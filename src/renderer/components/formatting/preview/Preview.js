import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { func, object } from 'prop-types'
import { v1 as uuid } from 'uuid'
import 'css/index/preview.css'

import { PrefsContext, WorkspaceContext } from 'store'

import {
	buildSource,
	debounce,
	extractPreviewRenderDependencies
} from 'utilities'

import AccordionPanel from '../../form_elements/AccordionPanel'
import PreviewViewport from './PreviewViewport'
import PreviewCanvas from './PreviewCanvas'
import Spinner from '../../svg/Spinner'
import Grid from './Grid'
import Controls from './Controls'

const { interop } = window.ABLE2

const Preview = ({ focused, eyedropper, setEyedropper, dispatch }) => {
	const { renderOutput, gridColor } = useContext(PrefsContext).preferences
	const { aspectRatioMarkers, grid, previewHeight, previewQuality, dispatch: workspaceDispatch } = useContext(WorkspaceContext)
	const [ previewSize, setPreviewSize ] = useState({})
	const [ previewStill, setPreviewStill ] = useState('')
	const container = useRef(null)
	const requestIdQueue = useRef([])

	const {
		mediaType,
		aspectRatio,
		arc,
		background,
		sourceName,
		sourcePrefix,
		sourceOnTop
	} = focused

	const sourceData = useMemo(() => {
		if (sourceName && !(arc === 'none' && aspectRatio !== '16:9')) {
			return buildSource({ sourceName, sourcePrefix, sourceOnTop, renderOutput, background })
		}

		return false
	}, [sourceName, sourcePrefix, sourceOnTop, arc, renderOutput, background])

	const isAudio = mediaType === 'audio' || mediaType === 'video' && focused.audioVideoTracks === 'audio'
	const isBars = focused.audioExportFormat === 'bars'

	// ---- Listen for preview still updates and rerender

	const checkResponseId = useCallback(({ responseId, base64 }) => {
		const queueIndex = requestIdQueue.current.indexOf(responseId)

		if (queueIndex > -1) {
			requestIdQueue.current.splice(0, queueIndex + 1)
			setPreviewStill(base64)
		}
	}, [])

	useEffect(() => {
		interop.setPreviewListeners(checkResponseId)

		return () => {
			interop.removePreviewListeners()
		}
	}, [])

	// ---- Initialize preview size based on window dimensions and update on resize

	const applyDimensions = useCallback(() => {
		setPreviewSize({
			width: container.current.clientWidth * previewQuality,
			height: container.current.clientHeight * previewQuality,
			frameWidth: container.current.clientWidth,
			frameHeight: container.current.clientHeight
		})
	}, [previewQuality])

	useEffect(() => {
		applyDimensions()
		
		const renderPreviewOnResize = debounce(applyDimensions, 500)

		window.addEventListener('resize', renderPreviewOnResize)

		return () => {
			window.removeEventListener('resize', renderPreviewOnResize)
		}
	}, [previewQuality])

	// ---- Update preview on attribute changes

	useEffect(() => {
		const requestId = uuid()

		requestIdQueue.current.push(requestId)

		interop.requestPreviewStill({
			...focused,
			isAudio,
			isBars,
			renderOutput,
			sourceData,
			previewSize,
			requestId
		})
	}, [...extractPreviewRenderDependencies(focused), previewSize, renderOutput])
	
	return (
		<>
			<PreviewViewport
				applyDimensions={applyDimensions}
				previewHeight={previewHeight}
				dispatch={workspaceDispatch}>
				<div id="preview-container" ref={container}>
					{previewStill ? (
						<PreviewCanvas
							previewStill={previewStill}
							previewSize={previewSize}
							eyedropper={eyedropper}
							setEyedropper={setEyedropper} />
					)	: <Spinner />}
					<Grid
						grid={grid}
						aspectRatioMarkers={aspectRatioMarkers}
						previewSize={previewSize}
						previewQuality={previewQuality}
						gridColor={gridColor} />
				</div>
			</PreviewViewport>
			<Controls
				focused={focused}
				isAudio={isAudio}
				aspectRatioMarkers={aspectRatioMarkers}
				grid={grid}
				gridColor={gridColor}
				previewQuality={previewQuality}
				dispatch={dispatch}
				workspaceDispatch={workspaceDispatch} />
		</>
	)
}

const PreviewPanel = props => (
	<AccordionPanel
		heading="Preview"
		id="preview"
		initOpen>
		{props.focused.id ? <Preview {...props} /> : <></>}
	</AccordionPanel>
)

const propTypes = {
	focused: object.isRequired,
	eyedropper: object.isRequired,
	setEyedropper: func.isRequired,
	dispatch: func.isRequired
}

Preview.propTypes = propTypes
PreviewPanel.propTypes = propTypes

export default PreviewPanel
