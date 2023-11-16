import React, { useContext, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import 'css/index/formatting.css'

import {
	MainContext,
	PrefsContext,
	PresetsProvider
} from 'store'

import { selectAllMedia, selectMedia } from 'actions'
import { arrayCount, focusSelectableItem, omitFromHistory, pipe } from 'utilities'

import MediaSelector from './selector/MediaSelector'
import BatchName from './BatchName'
import SaveOptions from './SaveOptions'
import SaveButtons from './SaveButtons'
import PreviewEditorContainer from './PreviewEditorContainer'

const Formatting = () => {
	const {
		media,
		batchNameType,
		batchName,
		batchNamePrepend,
		batchNameAppend,
		split,
		saveLocations,
		clipboard,
		dispatch
	} = useContext(MainContext)

	const { selectAllByDefault } = useContext(PrefsContext).preferences

	if (!media.length) return <Navigate replace to="/" />

	const focused = media.find(item => item.focused) || {}
	const multipleItems = media.length > 1
	const selectionCount = arrayCount(media, item => item.selected)
	const multipleItemsSelected = selectionCount > 1
	const allItemsSelected = selectionCount === media.length

	useEffect(() => {
		if (focused.id) {
			focusSelectableItem('#media-manager')
		} else {
			pipe(selectAllByDefault ? selectAllMedia : selectMedia, omitFromHistory, dispatch)(0)
		}
	}, [focused.id])

	return (
		<>
			<div id="media-manager">			
				<MediaSelector
					media={media}
					focused={focused}
					multipleItems={multipleItems}
					multipleItemsSelected={multipleItemsSelected}
					allItemsSelected={allItemsSelected}
					clipboard={clipboard}
					dispatch={dispatch} />	
				{multipleItems ? (
					<BatchName
						batchNameType={batchNameType}
						batchName={batchName}
						batchNamePrepend={batchNamePrepend}
						batchNameAppend={batchNameAppend}
						dispatch={dispatch} />
				) : <></>}
				<SaveOptions
					multipleItems={multipleItems}
					saveLocations={saveLocations}
					dispatch={dispatch} />
				<SaveButtons
					media={media}
					saveLocations={saveLocations}
					batchName={{
						batchNameType,
						batchName,
						batchNamePrepend,
						batchNameAppend
					}} />
			</div>
			<PreviewEditorContainer
				focused={focused}
				multipleItems={multipleItems}
				multipleItemsSelected={multipleItemsSelected}
				allItemsSelected={allItemsSelected}
				split={split}
				dispatch={dispatch} />
		</>
	)
}

export default () => (
	<PresetsProvider referencesOnly presorted enableSync>
		<Formatting />
	</PresetsProvider>
)
