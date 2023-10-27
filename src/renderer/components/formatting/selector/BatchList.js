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
	saveAsPreset,
	selectDuplicates,
	selectMedia
} from 'actions'

import { useWarning } from 'hooks'

import {
	eraseIds,
	extractRelevantMediaProps,
	isArrowNext,
	isArrowPrev
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

	const dispatchCopyAttributes = useCallback(id => {
		dispatch(copyAttributes(id, extractRelevantMediaProps, eraseIds))
	}, [])

	const dispatchPasteAttributes = useCallback(id => {
		dispatch(pasteAttributes(id))
	}, [])

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

	const moveMedia = useCallback((oldPos, newPos) => {
		dispatch(moveSortableElement('media', oldPos, newPos))
	}, [])

	const warnRemoveMedia = useWarning({ name: 'remove' }, [])

	const createDropdown = useCallback((index, id, refId, tempFilePath, removeMedia) => {
		const isFirst = index === 0
		const isLast = index === media.length - 1
		const isOnly = isFirst && isLast
		const ctrlOrCmdKeySymbol = interop.isMac ? '⌘' : '⌃'
		const clipboardIsEmpty = !Object.keys(clipboard).length

		return [
			{
				type: 'button',
				label: 'Copy All Attributes',
				hide: isOnly,
				shortcut: `${ctrlOrCmdKeySymbol}C`,
				action() {
					dispatchCopyAttributes(id)
				}
			},
			{
				type: 'button',
				label: 'Paste Attributes',
				hide: clipboardIsEmpty,
				shortcut: `${ctrlOrCmdKeySymbol}V`,
				action() {
					dispatchPasteAttributes(id)
				}
			},
			{
				type: 'button',
				label: 'Apply Attributes to Selected',
				hide: isOnly || !multipleItemsSelected,
				action() {
					applyToSelectionWarning(id)
				}
			},
			{
				type: 'button',
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
				type: 'button',
				label: 'Move Up',
				hide: isFirst,
				shortcut: '⌥↑',
				action() {
					moveMedia(index, index - 1)
				}
			},
			{
				type: 'button',
				label: 'Move Down',
				hide: isLast,
				shortcut: '⌥↓',
				action() {
					moveMedia(index, index + 2)
				}
			},
			{
				type: 'spacer',
				hide: isOnly
			},
			{
				type: 'button',
				label: 'Duplicate Media',
				shortcut: `${ctrlOrCmdKeySymbol}D`,
				action() {
					dispatch(duplicateMedia(index))
				}
			},
			{
				type: 'button',
				label: 'Select Duplicates',
				hide: isOnly,
				action() {
					dispatch(selectDuplicates(refId, index))
				}
			},
			{ type: 'spacer' },
			{
				type: 'submenu',
				label: 'Apply Preset',
				hide: !showApplyPresetOptions,
				submenu: createPresetMenu(presetIds => applyPreset(presetIds, id))
			},
			{
				type: 'submenu',
				label: 'Apply Preset as Duplicate',
				hide: !showApplyPresetOptions,
				submenu: createPresetMenu(presetIds => applyPreset(presetIds, id, true))
			},
			{
				type: 'button',
				label: 'Save as Preset',
				action() {
					dispatch(saveAsPreset(id, extractRelevantMediaProps, eraseIds))
				}
			},
			{ type: 'spacer' },
			{
				type: 'button',
				label: 'Remove Media',
				shortcut: '⌫',
				action: removeMedia
			},
			{ type: 'spacer' },
			{
				type: 'button',
				label: 'Reveal in Cache',
				action() {
					interop.revealInTempFolder(tempFilePath)
				}
			}
		]
	}, [clipboard, multipleItemsSelected, allItemsSelected, createPresetMenu, media.length])

	const onBatchItemKeyDown = useCallback((index, id, removeMedia, e) => {
		const isFirst = index === 0
		const isLast = index === media.length - 1
		const isOnly = isFirst && isLast
		const ctrlOrCmd = interop.isMac ? e.metaKey : e.ctrlKey

		if (ctrlOrCmd && !isOnly && e.key === 'c') {
			dispatchCopyAttributes(id)
		} else if (ctrlOrCmd && e.key === 'v') {
			dispatchPasteAttributes(id)
		} else if (e.altKey && isArrowPrev(e)) {
			e.preventDefault()
			moveMedia(index, index - 1)
		} else if (e.altKey && isArrowNext(e)) {
			e.preventDefault()
			moveMedia(index, index + 2)
		} else if (isArrowPrev(e)) {
			e.preventDefault()
			dispatch(selectMedia(index - 1, e, { arrowKeyDir: 'prev' }))
		} else if (isArrowNext(e)) {
			e.preventDefault()
			dispatch(selectMedia(index + 1, e, { arrowKeyDir: 'next' }))
		} else if (ctrlOrCmd && !e.shiftKey && e.key === 'd') {
			e.stopPropagation()
			dispatch(duplicateMedia(index))
		} else if (!e.shiftKey && (e.key === 'Backspace' || e.key === 'Delete')) {
			e.stopPropagation()
			removeMedia()
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
						title={item.title}
						focused={item.focused}
						anchored={item.anchored}
						selected={item.selected}
						warnRemoveMedia={warnRemoveMedia}
						createDropdown={removeMedia => createDropdown(i, item.id, item.refId, item.tempFilePath, removeMedia)}
						onKeyDown={(removeMedia, e) => onBatchItemKeyDown(i, item.id, removeMedia, e)}
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
