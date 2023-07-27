import React, { useCallback, useContext, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import 'css/index/formatting.css'

import { MainContext, PrefsContext } from 'store'

import {
	selectAllMedia,
	selectMedia,
	updateState
} from 'actions'

import { useClipboard } from 'hooks'
import { arrayCount } from 'utilities'

import MediaSelector from './selector/MediaSelector'
import BatchName from './BatchName'
import SaveOptions from './SaveOptions'
import SaveButtons from './SaveButtons'
import PreviewEditorContainer from './PreviewEditorContainer'
import RenderQueue from './render-queue/RenderQueue'

const Formatting = () => {
	const {
		media,
		batchName,
		batchNameType,
		split,
		saveLocations,
		aspectRatioMarkers,
		previewQuality,
		previewHeight,
		rendering,
		dispatch
	} = useContext(MainContext)

	const { selectAllByDefault } = useContext(PrefsContext).preferences

	if (!media.length) return <Navigate replace to="/" />

	const [ clipboard, copyToClipboard ] = useClipboard()

	const focused = media.find(item => item.focused) || {}
	const multipleItems = media.length > 1
	const selectionCount = arrayCount(media, item => item.selected)
	const multipleItemsSelected = selectionCount > 1
	const allItemsSelected = selectionCount === media.length

	const setRendering = useCallback(isRendering => {
		dispatch(updateState({ rendering: isRendering }))
	}, [])

	useEffect(() => {
		if (!focused.id) dispatch((selectAllByDefault ? selectAllMedia : selectMedia)(0))
	}, [focused])

	return (
		<form>
			<div id="media-manager">			
				<MediaSelector
					media={media}
					focused={focused}
					multipleItems={multipleItems}
					multipleItemsSelected={multipleItemsSelected}
					allItemsSelected={allItemsSelected}
					copyToClipboard={copyToClipboard}
					clipboard={clipboard}
					dispatch={dispatch} />	
				{multipleItems ? (
					<BatchName
						batchName={batchName}
						batchNameType={batchNameType}
						dispatch={dispatch} />
				) : <></>}
				<SaveOptions
					multipleItems={multipleItems}
					saveLocations={saveLocations}
					dispatch={dispatch} />
				<SaveButtons setRendering={setRendering} />
			</div>
			<PreviewEditorContainer
				focused={focused}
				aspectRatioMarkers={aspectRatioMarkers}
				previewQuality={previewQuality}
				previewHeight={previewHeight}
				multipleItems={multipleItems}
				multipleItemsSelected={multipleItemsSelected}
				allItemsSelected={allItemsSelected}
				copyToClipboard={copyToClipboard}
				split={split}
				dispatch={dispatch} />
			{rendering ? (
				<RenderQueue
					media={media}
					batchName={batchName}
					batchNameType={batchNameType}
					saveLocations={saveLocations}
					closeRenderQueue={() => setRendering(false)}
					dispatch={dispatch} />
			) : <></>}
		</form>
	)
}

export default Formatting
