import React, { useContext, useEffect, useMemo, useState } from 'react'
import '../../../css/index/preview.css'

import { PrefsContext } from '../../../store/preferences'
import buildSource from '../../../actions/buildSource'
import { extractSettingsToArray } from '../../../utilities'

import Spinner from '../../svg/Spinner'
import Grid from './Grid'
import Controls from './Controls'

const { interop } = window.ABLE2 

const Preview = ({ selected, dispatch }) => {
	const { renderOutput, gridColor } = useContext(PrefsContext)
	const { id, mediaType, source, arc, aspectRatio, rotation, timecode, start, end, duration, fps } = selected

	const [ previewReady, setPreviewReady ] = useState(false)
	const [ open, toggleOpen ] = useState(false)
	const [ previewStill, loadPreviewStill ] = useState('')
	
	const [ grids, toggleGrids ] = useState({
		grid: false,
		_43: false,
		_11: false,
		_916: false
	})

	const sourceData = useMemo(() => (
		source.sourceName && !(arc === 'none' && aspectRatio !== '16:9')
			? buildSource(source, renderOutput)
			: false
	), [source, arc, rotation])

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
				tempFilePath: selected.tempFilePath,
				tc: timecode / fps / duration * 100
			})

			setPreviewReady(true)
		})()
	}, [id, timecode, start, end])

	useEffect(() => {
		if (previewReady && open) {
			interop.requestPreviewStill({
				...selected,
				renderOutput,
				sourceData
			})
		}
	}, [previewReady, open, ...settings, sourceData])

	return (
		<details onToggle={() => { toggleOpen(!open) }} open>
			<summary>Preview</summary>
			{open && (
				<div id="preview">
					<div>
						<div id="preview-container">
							{previewStill ? (
								<span style={{ backgroundImage: `url("${previewStill}")`}}></span>
							) : (
								<Spinner />
							)}
							<Grid grids={grids} gridColor={gridColor} />
						</div>
					</div>
					<Controls
						id={id}
						mediaType={mediaType}
						timecode={timecode}
						start={start}
						end={end}
						fps={fps}
						duration={duration}
						grids={grids}
						gridColor={gridColor}
						toggleGrids={toggleGrids}
						dispatch={dispatch} />
				</div>
			)}
		</details>
	)
}

export default Preview
