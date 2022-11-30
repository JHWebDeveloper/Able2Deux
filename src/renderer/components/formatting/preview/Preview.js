import React, { useContext, useEffect, useMemo, useState } from 'react'
import { func, object } from 'prop-types'
import 'css/index/preview.css'

import { PrefsContext } from 'store/preferences'
import { buildSource } from 'utilities'

import PreviewCanvas from './PreviewCanvas'
import Spinner from '../../svg/Spinner'
import Grid from './Grid'
import Controls from './Controls'

const { interop } = window.ABLE2

const Preview = ({ selected, dispatch }) => {
	const { renderOutput, gridButtons, gridColor } = useContext(PrefsContext).preferences

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

	const [ previewStill, loadPreviewStill ] = useState('')
	
	const [ grids, toggleGrids ] = useState({
		grid: false,
		_239: false,
		_185: false,
		_166: false,
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
	}, [id, mediaType, isAudio, audio?.format, timecode])

	useEffect(() => {
		interop.requestPreviewStill({
			...selected,
			isAudio,
			renderOutput,
			sourceData
		})
	}, [
		renderOutput,
		audio,
		arc,
		background,
		source,
		rotation,
		selected.bgColor,
		selected.overlay,
		selected.centering,
		selected.position,
		selected.scale,
		selected.crop
	])

	return (
		<div id="preview">
			<div>
				<div id="preview-container">
					{previewStill
						? <PreviewCanvas previewStill={previewStill} />
						: <Spinner />}
					<Grid
						grids={grids}
						gridButtons={gridButtons}
						gridColor={gridColor} />
				</div>
			</div>
			{!isAudio ? (
				<Controls
					selected={selected}
					grids={grids}
					gridButtons={gridButtons}
					gridColor={gridColor}
					toggleGrids={toggleGrids}
					dispatch={dispatch} />
			) : <></>}
		</div>
	)
}

Preview.propTypes = {
	selected: object.isRequired,
	dispatch: func.isRequired
}

export default Preview
