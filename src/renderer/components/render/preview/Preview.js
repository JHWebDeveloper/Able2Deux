import React, { useContext, useEffect, useMemo, useState } from 'react'
import { func, object } from 'prop-types'
import '../../../css/index/preview.css'

import { PrefsContext } from '../../../store/preferences'
import { buildSource, extractSettingsToArray } from '../../../utilities'

import Spinner from '../../svg/Spinner'
import Grid from './Grid'
import Controls from './Controls'

const { interop } = window.ABLE2 

const Preview = ({ selected, dispatch }) => {
	const { renderOutput, enableWidescreenGrids, gridColor } = useContext(PrefsContext).preferences

	const {
		id,
		mediaType,
		duration,
		aspectRatio,
		fps,
		hasAlpha,
		start,
		end,
		audio,
		arc,
		source,
		rotation,
		timecode
	} = selected

	const [ previewReady, setPreviewReady ] = useState(false)
	const [ open, toggleOpen ] = useState(false)
	const [ previewStill, loadPreviewStill ] = useState('')
	
	const [ grids, toggleGrids ] = useState({
		_239: false,
		_185: false,
		grid: false,
		_43: false,
		_11: false,
		_916: false
	})

	const sourceData = useMemo(() => (
		source.sourceName &&
		!(arc === 'none' && aspectRatio !== '16:9') &&
		buildSource(source, renderOutput)
	), [source, arc, rotation, renderOutput])

	const isAudio = mediaType === 'audio' || mediaType === 'video' && audio.exportAs === 'audio'
	const settings = extractSettingsToArray(selected)

	useEffect(() => {
		interop.setPreviewListeners(loadPreviewStill)

		return () => {
			interop.removePreviewListeners()
		}
	}, [])

	useEffect(() => {
		(async () => {
			setPreviewReady(false)

			await interop.initPreview({
				id,
				mediaType,
				hasAlpha,
				isAudio,
				format: audio.format,
				tempFilePath: selected.tempFilePath,
				tc: timecode / fps / duration * 100
			})

			setPreviewReady(true)
		})()
	}, [id, mediaType, isAudio, audio.format, timecode, start, end])

	useEffect(() => {
		if (previewReady && open) {
			interop.requestPreviewStill({
				...selected,
				isAudio,
				renderOutput,
				sourceData
			})
		}
	}, [previewReady, open, ...settings, sourceData, renderOutput])

	return (
		<details onToggle={() => { toggleOpen(!open) }} open>
			<summary>Preview</summary>
			{open && (
				<div id="preview">
					<div>
						<div id="preview-container">
							{previewStill
								? <span style={{ backgroundImage: `url("${previewStill}")`}}></span>
								: <Spinner />}
							<Grid
								grids={grids}
								enableWidescreenGrids={enableWidescreenGrids}
								gridColor={gridColor} />
						</div>
					</div>
					<div id="preview-controls">
						{!isAudio && (
							<Controls
								id={id}
								mediaType={mediaType}
								timecode={timecode}
								start={start}
								end={end}
								fps={fps}
								duration={duration}
								grids={grids}
								enableWidescreenGrids={enableWidescreenGrids}
								gridColor={gridColor}
								toggleGrids={toggleGrids}
								dispatch={dispatch} />
						)}
					</div>
				</div>
			)}
		</details>
	)
}

Preview.propTypes = {
	selected: object.isRequired,
	dispatch: func.isRequired
}

export default Preview
