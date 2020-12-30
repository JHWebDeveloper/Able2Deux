import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { bool, func, object } from 'prop-types'
import 'css/index/preview.css'

import { PrefsContext } from 'store/preferences'
import { updateMediaState } from 'actions'
import { buildSource } from 'utilities'

import PreviewCanvas from './PreviewCanvas'
import Spinner from '../../svg/Spinner'
import Grid from './Grid'
import Controls from './Controls'

const { interop } = window.ABLE2

const extractPreviewTriggers = settings => {
	const { start, audio, arc, background, bgColor, overlay, source, centering, position, scale, crop, rotation } = settings
	return [ start, audio, arc, background, bgColor, overlay, source, centering, position, scale, crop, rotation ]
}

const Preview = ({ selected, editAll, dispatch }) => {
	const { renderOutput, enableWidescreenGrids, gridColor } = useContext(PrefsContext).preferences

	const {
		id,
		mediaType,
		duration,
		aspectRatio,
		fps,
		start,
		end,
		audio,
		arc,
		source,
		rotation,
		timecode
	} = selected

	const [ previewStill, loadPreviewStill ] = useState('')
	
	const [ grids, toggleGrids ] = useState({
		_239: false,
		_185: false,
		grid: false,
		_43: false,
		_11: false,
		_916: false
	})

	const sourceData = useMemo(() => {
		if (source?.sourceName && !(arc === 'none' && aspectRatio !== '16:9')) {
			return buildSource(source, renderOutput)
		}

		return false
	}, [source, arc, rotation, renderOutput])

	const isAudio = mediaType === 'audio' || mediaType === 'video' && audio?.exportAs === 'audio'

	const setEyedropToBgColor = useCallback(bgColor => {
		dispatch(updateMediaState(id, { bgColor }, editAll))
	}, [id, editAll])

	useEffect(() => {
		interop.setPreviewListeners(loadPreviewStill)

		return () => {
			interop.removePreviewListeners()
		}
	}, [])

	useEffect(() => {
		interop.initPreview({
			...selected,
			isAudio,
			renderOutput,
			sourceData,
			tc: timecode / fps / duration * 100
		})
	}, [id, mediaType, isAudio, audio?.format, timecode, start, end])

	useEffect(() => {
		interop.requestPreviewStill({
			...selected,
			isAudio,
			renderOutput,
			sourceData
		})
	}, [renderOutput, ...extractPreviewTriggers(selected)])

	return (
		<div id="preview">
			<div>
				<div id="preview-container">
					{previewStill ? (
						<PreviewCanvas
							previewStill={previewStill}
							eyedropper={selected.background === 'color'}
							setEyedropToBgColor={setEyedropToBgColor}/>
					) : <Spinner />}
					<Grid
						grids={grids}
						enableWidescreenGrids={enableWidescreenGrids}
						gridColor={gridColor} />
				</div>
			</div>
			{!isAudio && (
				<Controls
					selected={selected}
					grids={grids}
					enableWidescreenGrids={enableWidescreenGrids}
					gridColor={gridColor}
					toggleGrids={toggleGrids}
					dispatch={dispatch} />
			)}
		</div>
	)
}

Preview.propTypes = {
	selected: object.isRequired,
	editAll: bool.isRequired,
	dispatch: func.isRequired
}

export default Preview
