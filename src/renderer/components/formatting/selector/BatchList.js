import React, { useCallback, useContext } from 'react'
import { arrayOf, bool, func, object } from 'prop-types'

import { PrefsContext } from 'store'

import {
	applySettingsToAll,
	applySettingsToSelection,
	copySettings,
	disableWarningAndSave,
	moveSortableElement,
	moveSelectedMedia,
	removeMedia
} from 'actions'

import {
	arrayCount,
	extractCopyPasteProps,
	pipe,
	warn
} from 'utilities'

import DraggableList from '../../form_elements/DraggableList'
import BatchItem from './BatchItem'

const applyToAllDetail = 'This will overwrite the settings except for filenames and start and end timecodes. This cannot be undone. Proceed?'
const removeMediaDetail = 'This cannot be undone. Proceed?'

const BatchList = ({ media, multipleItemsSelected, allItemsSelected, dispatch }) => {
	const { preferences, dispatch: dispatchPrefs } = useContext(PrefsContext)
	const { warnings } = preferences

	const copyAllSettings = useCallback(id => {
		pipe(extractCopyPasteProps, copySettings, dispatch)(media.find(item => item.id === id))
	}, [media])

	const applyToMultipleWarning = useCallback(({ id, message, action }) => warn({
		message,
		detail: applyToAllDetail,
		enabled: warnings.applyToAll,
		callback() {
			pipe(extractCopyPasteProps, action, dispatch)(media.find(item => item.id === id))
		},
		checkboxCallback() {
			dispatchPrefs(disableWarningAndSave('applyToAll'))
		}
	}), [media, warnings.applyToAll])

	const applyToAllWarning = useCallback(id => applyToMultipleWarning({
		id,
		message: 'Apply current settings to all media items?',
		action: applySettingsToAll(id)
	}), [media, warnings.applyToAll])

	const applyToSelectionWarning = useCallback(id => applyToMultipleWarning({
		id,
		message: 'Apply current settings to the selected media items?',
		action: applySettingsToSelection(id)
	}), [media, warnings.applyToAll])

	const removeMediaWarning = useCallback(({ id, refId, index, title }) => warn({
		message: `Remove "${title}"?`,
		detail: removeMediaDetail,
		enabled: warnings.remove,
		callback() {
			dispatch(removeMedia({
				id,
				refId,
				index,
				references: arrayCount(media, item => item.refId === refId)
			}))
		},
		checkboxCallback() {
			dispatchPrefs(disableWarningAndSave('remove'))
		}
	}), [media, warnings.remove])

	const sortingAction = useCallback((oldPos, newPos, { selected }, e) => {
		if (!selected || e.shiftKey || allItemsSelected) {
			dispatch(moveSortableElement('media', oldPos, newPos))
		} else {
			dispatch(moveSelectedMedia(newPos))
		}
	}, [allItemsSelected])

	return (
		<div>
			<DraggableList sortingAction={sortingAction}>
				{media.map(({ id, refId, focused, anchored, selected, title, tempFilePath }, i) => (
					<BatchItem
						key={id}
						id={id}
						refId={refId}
						title={title}
						tempFilePath={tempFilePath}
						focused={focused}
						anchored={anchored}
						selected={selected}
						index={i}
						isFirst={i === 0}
						isLast={i === media.length - 1}
						prevSelected={media?.[i - 1]?.selected}
						nextSelected={media?.[i + 1]?.selected}
						copyAllSettings={copyAllSettings}
						applyToAllWarning={applyToAllWarning}
						applyToSelectionWarning={applyToSelectionWarning}
						removeMediaWarning={removeMediaWarning}
						multipleItemsSelected={multipleItemsSelected}
						allItemsSelected={allItemsSelected}
						dispatch={dispatch} />
				))}
			</DraggableList>
		</div>
	)
}

BatchList.propTypes = {
	media: arrayOf(object).isRequired,
	multipleItemsSelected: bool.isRequired,
	allItemsSelected: bool.isRequired,
	dispatch: func.isRequired
}

export default BatchList
