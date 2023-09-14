import React, { useCallback } from 'react'
import { arrayOf, bool, func, object } from 'prop-types'

import {
	applyPreset,
	applyToAll,
	applyToSelection,
	copyAttributes,
	duplicateMedia,
	moveSortableElement,
	moveSelectedMedia,
	pasteAttributes,
	removeMedia,
	saveAsPreset,
	selectDuplicates,
	selectMedia
} from 'actions'

import { useWarning } from 'hooks'

import {
	arrayCount,
	eraseIds,
	extractRelevantMediaProps,
	isArrowNext,
	isArrowPrev,
	refocusBatchItem
} from 'utilities'

import DraggableList from '../../form_elements/DraggableList'
import BatchItem from './BatchItem'

const { interop } = window.ABLE2

const BatchList = ({
	media,
	multipleItemsSelected,
	allItemsSelected,
	createPresetMenu,
	showApplyPresetOptions,
	clipboard,
	dispatch
}) => {
	const sortingAction = useCallback((oldPos, newPos, { selected }, e) => {
		if (!selected || e.altKey || allItemsSelected) {
			dispatch(moveSortableElement('media', oldPos, newPos))
		} else {
			dispatch(moveSelectedMedia(newPos))
		}
	}, [allItemsSelected])

	const warnApplyToMultiple = useWarning({
		name: 'applyToAll',
		detail: 'This will overwrite the settings except for filenames and start and end timecodes. This cannot be undone. Proceed?'
	}, [])

	const applyToMultipleWarning = useCallback(({ message, action }) => warnApplyToMultiple({
		message,
		onConfirm() {
			dispatch(action)
		}
	}), [])

	const applyToAllWarning = useCallback(id => applyToMultipleWarning({
		message: 'Apply current settings to all media items?',
		action: applyToAll(id, extractRelevantMediaProps)
	}), [])

	const applyToSelectionWarning = useCallback(id => applyToMultipleWarning({
		message: 'Apply current settings to the selected media items?',
		action: applyToSelection(id, extractRelevantMediaProps)
	}), [])

	const warnRemoveMedia = useWarning({ name: 'remove' }, [])

	const removeMediaWarning = useCallback(({ id, refId, index, title }) => warnRemoveMedia({
		message: `Remove "${title}"?`,
		onConfirm() {
			dispatch(removeMedia({
				id,
				refId,
				index,
				references: arrayCount(media, item => item.refId === refId)
			}))

			refocusBatchItem()
		}
	}), [])

	const createDropdown = useCallback((id, refId, title, tempFilePath, index) => {
		const isFirst = index === 0
		const isLast = index === media.length - 1
		const isOnly = isFirst && isLast
		const ctrlOrCmdKeySymbol = interop.isMac ? '⌘' : '⌃'
		const clipboardIsEmpty = !Object.keys(clipboard).length

		return [
			{
				label: 'Copy All Attributes',
				hide: isOnly,
				shortcut: `${ctrlOrCmdKeySymbol}C`,
				action() {
					dispatch(copyAttributes(id, extractRelevantMediaProps, eraseIds))
				}
			},
			{
				label: 'Paste Attributes',
				hide: clipboardIsEmpty,
				shortcut: `${ctrlOrCmdKeySymbol}V`,
				action() {
					dispatch(pasteAttributes(id))
				}
			},
			{
				label: 'Apply Attributes to Selected',
				hide: isOnly || !multipleItemsSelected,
				action() {
					applyToSelectionWarning(id)
				}
			},
			{
				label: 'Apply Attributes to All',
				hide: isOnly || multipleItemsSelected,
				action() {
					applyToAllWarning(id)
				}
			},
			{
				type: 'spacer',
				hide: isOnly && clipboardIsEmpty
			},
			{
				label: 'Move Up',
				hide: isFirst,
				shortcut: '⌥↑',
				action() {
					dispatch(moveSortableElement('media', index, index - 1))
				}
			},
			{
				label: 'Move Down',
				hide: isLast,
				shortcut: '⌥↓',
				action() {
					dispatch(moveSortableElement('media', index, index + 2))
				}
			},
			{
				type: 'spacer',
				hide: isOnly
			},
			{
				label: 'Duplicate Media',
				shortcut: `${ctrlOrCmdKeySymbol}D`,
				action() {
					dispatch(duplicateMedia(index))
				}
			},
			{
				label: 'Select Duplicates',
				hide: isOnly,
				action() {
					dispatch(selectDuplicates(refId, index))
				}
			},
			{ type: 'spacer' },
			{
				label: 'Apply Preset',
				hide: !showApplyPresetOptions,
				submenu: createPresetMenu(presetIds => applyPreset(presetIds, id))
			},
			{
				label: 'Apply Preset as Duplicate',
				hide: !showApplyPresetOptions,
				submenu: createPresetMenu(presetIds => applyPreset(presetIds, id, true))
			},
			{
				label: 'Save as Preset',
				action() {
					dispatch(saveAsPreset(id, extractRelevantMediaProps, eraseIds))
				}
			},
			{ type: 'spacer' },
			{
				label: 'Remove Media',
				shortcut: '⌫',
				action() {
					removeMediaWarning({ id, refId, index, title })
				}
			},
			{ type: 'spacer' },
			{
				label: 'Reveal in Cache',
				action() {
					interop.revealInTempFolder(tempFilePath)
				}
			}
		]
	}, [clipboard, multipleItemsSelected, allItemsSelected, createPresetMenu, media.length])

	const onBatchItemKeyDown = useCallback((id, refId, title, index, e) => {
		const isFirst = index === 0
		const isLast = index === media.length - 1
		const isOnly = isFirst && isLast
		const ctrlOrCmd = interop.isMac ? e.metaKey : e.ctrlKey

		if (ctrlOrCmd && !isOnly && e.key === 'c') {
			dispatch(copyAttributes(id, extractRelevantMediaProps))
		} else if (ctrlOrCmd && e.key === 'v') {
			dispatch(pasteAttributes(id))
		} else if (e.altKey && isArrowPrev(e)) {
			dispatch(moveSortableElement('media', index, index - 1))
		} else if (e.altKey && isArrowNext(e)) {
			dispatch(moveSortableElement('media', index, index + 2))
		} else if (isArrowPrev(e)) {
			dispatch(selectMedia(index - 1, e, { arrowKeyDir: 'prev' }))
		} else if (isArrowNext(e)) {
			dispatch(selectMedia(index + 1, e, { arrowKeyDir: 'next' }))
		} else if (ctrlOrCmd && !e.shiftKey && e.key === 'd') {
			e.stopPropagation()
			dispatch(duplicateMedia(index))
		} else if (!e.shiftKey && (e.key === 'Backspace' || e.ket === 'Delete')) {
			e.stopPropagation()
			removeMediaWarning({ id, refId, index, title })
		}
	}, [media.length])

	return (
		<div>
			<DraggableList sortingAction={sortingAction}>
				{media.map((item, i) => (
					<BatchItem
						key={item.id}
						index={i}
						id={item.id}
						refId={item.refId}
						title={item.title}
						tempFilePath={item.tempFilePath}
						focused={item.focused}
						anchored={item.anchored}
						selected={item.selected}
						removeMediaWarning={removeMediaWarning}
						createDropdown={createDropdown}
						onKeyDown={onBatchItemKeyDown}
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
	showApplyPresetOptions: bool.isRequired,
	clipboard: object,
	createPresetMenu: func.isRequired,
	dispatch: func.isRequired
}

export default BatchList
