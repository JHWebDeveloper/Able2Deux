import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { arrayOf, bool, exact, func, number, object, oneOf, string } from 'prop-types'
import { v1 as uuid } from 'uuid'
import 'css/index/preview.css'

import { PrefsContext } from 'store'
import { useToggle } from 'hooks'

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

const Preview = ({ focused, eyedropper, setEyedropper, aspectRatioMarkers, previewQuality, dispatch }) => {
	const { renderOutput, gridColor } = useContext(PrefsContext).preferences
	const [ previewSize, setPreviewSize ] = useState({})
	const [ previewStill, setPreviewStill ] = useState('')
	const [ grid, toggleGrid ] = useToggle()
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
			<PreviewViewport applyDimensions={applyDimensions}>
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
				grid={grid}
				aspectRatioMarkers={aspectRatioMarkers}
				previewQuality={previewQuality}
				gridColor={gridColor}
				toggleGrid={toggleGrid}
				dispatch={dispatch} />
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
	previewQuality: oneOf([1, 0.75, 0.5]).isRequired,
	aspectRatioMarkers: arrayOf(exact({
		id: string,
		label: string,
		disabled: bool,
		selected: bool,
		ratio: arrayOf(number)
	})).isRequired,
	eyedropper: object.isRequired,
	setEyedropper: func.isRequired,
	dispatch: func.isRequired
}

Preview.propTypes = propTypes
PreviewPanel.propTypes = propTypes

export default PreviewPanel
