import React, { useCallback } from 'react'
import { arrayOf, bool, func, object } from 'prop-types'

import {
	applySettingsToAll,
	applySettingsToSelection,
	moveSortableElement,
	moveSelectedMedia,
	removeMedia
} from 'actions'

import { useWarning } from 'hooks'

import {
	arrayCount,
	extractCopyPasteProps,
	pipe
} from 'utilities'

import DraggableList from '../../form_elements/DraggableList'
import BatchItem from './BatchItem'

const applyToAllDetail = 'This will overwrite the settings except for filenames and start and end timecodes. This cannot be undone. Proceed?'

const BatchList = ({ media, multipleItemsSelected, allItemsSelected, copyToClipboard, clipboard, dispatch }) => {
	const copyAllSettings = useCallback(id => {
		pipe(extractCopyPasteProps, copyToClipboard)(media.find(item => item.id === id))
	}, [media])

	const warnApplyToMultiple = useWarning({
		name: 'applyToAll',
		detail: applyToAllDetail
	}, [media])

	const applyToMultipleWarning = useCallback(({ id, message, action }) => warnApplyToMultiple({
		message,
		onConfirm() {
			pipe(extractCopyPasteProps, action, dispatch)(media.find(item => item.id === id))
		}
	}), [media, warnApplyToMultiple])

	const applyToAllWarning = useCallback(id => applyToMultipleWarning({
		id,
		message: 'Apply current settings to all media items?',
		action: applySettingsToAll(id)
	}), [media, warnApplyToMultiple])

	const applyToSelectionWarning = useCallback(id => applyToMultipleWarning({
		id,
		message: 'Apply current settings to the selected media items?',
		action: applySettingsToSelection(id)
	}), [media, warnApplyToMultiple])

	const warnRemoveMedia = useWarning({ name: 'remove' }, [media])

	const removeMediaWarning = useCallback(({ id, refId, index, title }) => warnRemoveMedia({
		message: `Remove "${title}"?`,
		onConfirm() {
			dispatch(removeMedia({
				id,
				refId,
				index,
				references: arrayCount(media, item => item.refId === refId)
			}))
		}
	}), [media, warnRemoveMedia])

	const sortingAction = useCallback((oldPos, newPos, { selected }, e) => {
		if (!selected || e.altKey || allItemsSelected) {
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
						clipboard={clipboard}
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
	copyToClipboard: func.isRequired,
	clipboard: object,
	dispatch: func.isRequired
}

export default BatchList
