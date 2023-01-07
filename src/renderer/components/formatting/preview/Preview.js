import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { arrayOf, bool, exact, func, number, object, oneOf, string } from 'prop-types'
import 'css/index/preview.css'

import { PrefsContext } from 'store/preferences'
import { buildSource, debounce } from 'utilities'

import PreviewCanvas from './PreviewCanvas'
import Spinner from '../../svg/Spinner'
import Grid from './Grid'
import Controls from './Controls'

const { interop } = window.ABLE2

const Preview = ({ selected, eyedropper, setEyedropper, aspectRatioMarkers, previewQuality, dispatch }) => {
	const { renderOutput, gridColor } = useContext(PrefsContext).preferences
	const [ previewSize, setPreviewSize ] = useState({})
	const [ previewStill, loadPreviewStill ] = useState('')
	const [ showGrid, toggleGrid ] = useState(false)
	const container = useRef()

	const {
		id,
		mediaType,
		duration,
		aspectRatio,
		fps,
		audio,
		arc,
		background,
		source,
		rotation,
		timecode
	} = selected

	const sourceData = useMemo(() => {
		if (source?.sourceName && !(arc === 'none' && aspectRatio !== '16:9')) {
			return buildSource(source, renderOutput, background)
		}

		return false
	}, [source, arc, rotation, renderOutput, background])

	const isAudio = mediaType === 'audio' || mediaType === 'video' && audio?.exportAs === 'audio'

	const calcPreviewSize = useCallback(() => ({
		width: container.current.clientWidth * previewQuality,
		height: container.current.clientHeight * previewQuality
	}), [previewQuality])

	// ---- Listen for preview still updates and rerender

	useEffect(() => {
		interop.setPreviewListeners(loadPreviewStill)

		return () => {
			interop.removePreviewListeners()
		}
	}, [])

	// ---- Initialize preview size based on window dimensions and update on resize

	useEffect(() => {
		const applyDimenions = () => setPreviewSize(calcPreviewSize())

		applyDimenions()
		
		const applyDimenionsOnResize = debounce(applyDimenions, 500)

		window.addEventListener('resize', applyDimenionsOnResize)

		return () => {
			window.removeEventListener('resize', applyDimenionsOnResize)
		}
	}, [previewQuality])

	// ---- Create new preview still on source or timecode change

	useEffect(() => {
		interop.initPreview({
			...selected,
			isAudio,
			renderOutput,
			sourceData,
			previewSize: calcPreviewSize()
		})
	}, [id, mediaType, isAudio, audio?.format, timecode])

	// ---- Update preview on attribute changes

	useEffect(() => {
		interop.requestPreviewStill({
			...selected,
			isAudio,
			renderOutput,
			sourceData,
			previewSize
		})
	}, [
		previewSize,
		renderOutput,
		arc,
		background,
		source,
		rotation,
		selected.bgColor,
		selected.overlay,
		selected.centering,
		selected.position,
		selected.scale,
		selected.crop,
		selected.keying,
		selected.colorCurves
	])

	return (
		<div id="preview">
			<div>
				<div id="preview-container" ref={container}>
					{previewStill ? (
						<PreviewCanvas
							previewStill={previewStill}
							previewSize={previewSize}
							eyedropper={eyedropper}
							setEyedropper={setEyedropper} />
					)	: <Spinner />}
					<Grid
						showGrid={showGrid}
						aspectRatioMarkers={aspectRatioMarkers}
						previewSize={previewSize}
						gridColor={gridColor} />
				</div>
			</div>
			<Controls
				selected={selected}
				isAudio={isAudio}
				showGrid={showGrid}
				aspectRatioMarkers={aspectRatioMarkers}
				previewQuality={previewQuality}
				gridColor={gridColor}
				toggleGrid={toggleGrid}
				dispatch={dispatch} />
		</div>
	)
}

Preview.propTypes = {
	selected: object.isRequired,
	previewQuality: oneOf([1, 0.75, 0.5]),
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

export default Preview
