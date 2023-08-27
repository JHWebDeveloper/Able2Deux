import React, { useCallback } from 'react'
import { arrayOf, bool, func, object } from 'prop-types'

import {
	applySettingsToAll,
	applySettingsToSelection,
	duplicateMedia,
	moveSortableElement,
	moveSelectedMedia,
	pasteSettings,
	removeMedia,
	selectMedia
} from 'actions'

import { useWarning } from 'hooks'

import {
	arrayCount,
	extractCopyPasteProps,
	isArrowNext,
	isArrowPrev,
	pipe,
	refocusBatchItem
} from 'utilities'

import DraggableList from '../../form_elements/DraggableList'
import BatchItem from './BatchItem'

const { interop } = window.ABLE2

const applyToAllDetail = 'This will overwrite the settings except for filenames and start and end timecodes. This cannot be undone. Proceed?'

const BatchList = ({ media, multipleItemsSelected, allItemsSelected, createPresetMenu, copyToClipboard, clipboard, dispatch }) => {
	const sortingAction = useCallback((oldPos, newPos, { selected }, e) => {
		if (!selected || e.altKey || allItemsSelected) {
			dispatch(moveSortableElement('media', oldPos, newPos))
		} else {
			dispatch(moveSelectedMedia(newPos))
		}
	}, [allItemsSelected])

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

			refocusBatchItem()
		}
	}), [media, warnRemoveMedia])

	const createDropdown = useCallback(({ id, refId, index, title, tempFilePath }) => {
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
					copyAllSettings(id)
				}
			},
			{
				label: 'Paste Attributes',
				hide: clipboardIsEmpty,
				shortcut: `${ctrlOrCmdKeySymbol}V`,
				action() {
					dispatch(pasteSettings(id, clipboard))
				}
			},
			{
				label: 'Apply Attributes to Selected',
				hide: isOnly || !multipleItemsSelected,
				action() {
					dispatch(applyToSelectionWarning(id))
				}
			},
			{
				label: 'Apply Attributes to All',
				hide: isOnly || allItemsSelected,
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
			{ type: 'spacer' },
			{
				label: 'Apply Preset',
				submenu: createPresetMenu(id),
			},
			{
				label: 'Apply Preset as Duplicate',
				submenu: createPresetMenu(id, true),
			},
			{
				label: 'Save as Preset',
				action() {}
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
	}, [media, clipboard, multipleItemsSelected, allItemsSelected, createPresetMenu, warnRemoveMedia])

	const onBatchItemKeyDown = useCallback(({ id, refId, index, title }, e) => {
		const isFirst = index === 0
		const isLast = index === media.length - 1
		const isOnly = isFirst && isLast
		const ctrlOrCmd = interop.isMac ? e.metaKey : e.ctrlKey

		if (ctrlOrCmd && !isOnly && e.key === 'c') {
			copyAllSettings(id)
		} else if (ctrlOrCmd && e.key === 'v') {
			dispatch(pasteSettings(id, clipboard))
		} else if (e.altKey && isArrowPrev(e)) {
			dispatch(moveSortableElement('media', index, index - 1))
		} else if (e.altKey && isArrowNext(e)) {
			dispatch(moveSortableElement('media', index, index + 2))
		} else if (isArrowPrev(e)) {
			dispatch(selectMedia(index - 1, e, {
				selected: media?.[index - 1]?.selected ?? true
			}))
		} else if (isArrowNext(e)) {
			dispatch(selectMedia(index + 1, e, {
				selected: media?.[index + 1]?.selected ?? true
			}))
		} else if (ctrlOrCmd && !e.shiftKey && e.key === 'd') {
			e.stopPropagation()
			dispatch(duplicateMedia(index))
		} else if (!e.shiftKey && (e.key === 'Backspace' || e.ket === 'Delete')) {
			e.stopPropagation()
			removeMediaWarning({ id, refId, index, title })
		}
	}, [media, clipboard, warnRemoveMedia])

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
						copyAllSettings={copyAllSettings}
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
	copyToClipboard: func.isRequired,
	clipboard: object,
	dispatch: func.isRequired
}

export default BatchList
