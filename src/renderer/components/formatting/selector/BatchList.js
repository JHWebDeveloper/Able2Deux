import React, { useCallback } from 'react'
import { arrayOf, bool, func, object } from 'prop-types'

import {
	applyPreset,
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
	extractRelevantMediaProps,
	isArrowNext,
	isArrowPrev,
	pipe,
	refocusBatchItem
} from 'utilities'

import DraggableList from '../../form_elements/DraggableList'
import BatchItem from './BatchItem'

const { interop } = window.ABLE2

const applyToAllDetail = 'This will overwrite the settings except for filenames and start and end timecodes. This cannot be undone. Proceed?'

const BatchList = ({
	media,
	multipleItemsSelected,
	allItemsSelected,
	createPresetMenu,
	showApplyPresetOptions,
	copyToClipboard,
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

	const copyAllSettings = useCallback(attributes => {
		pipe(extractCopyPasteProps, copyToClipboard)(attributes)
	}, [])

	const warnApplyToMultiple = useWarning({
		name: 'applyToAll',
		detail: applyToAllDetail
	}, [])

	const applyToMultipleWarning = useCallback(({ attributes, message, action }) => warnApplyToMultiple({
		message,
		onConfirm() {
			pipe(extractCopyPasteProps, action, dispatch)(attributes)
		}
	}), [])

	const applyToAllWarning = useCallback(attributes => applyToMultipleWarning({
		attributes,
		message: 'Apply current settings to all media items?',
		action: applySettingsToAll(attributes.id)
	}), [])

	const applyToSelectionWarning = useCallback(attributes => applyToMultipleWarning({
		attributes,
		message: 'Apply current settings to the selected media items?',
		action: applySettingsToSelection(attributes.id)
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
	}), [warnRemoveMedia])

	const createDropdown = useCallback((attributes, index) => {
		const { id, refId, title, tempFilePath } = attributes
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
					copyAllSettings(attributes)
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
					dispatch(applyToSelectionWarning(attributes))
				}
			},
			{
				label: 'Apply Attributes to All',
				hide: isOnly || multipleItemsSelected,
				action() {
					applyToAllWarning(attributes)
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
					interop.openPresetsSaveAs(extractRelevantMediaProps(attributes))
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
	}, [clipboard, multipleItemsSelected, allItemsSelected, createPresetMenu, warnRemoveMedia])

	const onBatchItemKeyDown = useCallback((attributes, index, e) => {
		const { id, refId, title } = attributes
		const isFirst = index === 0
		const isLast = index === media.length - 1
		const isOnly = isFirst && isLast
		const ctrlOrCmd = interop.isMac ? e.metaKey : e.ctrlKey

		if (ctrlOrCmd && !isOnly && e.key === 'c') {
			copyAllSettings(attributes)
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
	}, [clipboard, warnRemoveMedia])

	return (
		<div>
			<DraggableList sortingAction={sortingAction}>
				{media.map((props, i) => (
					<BatchItem
						key={props.id}
						attributes={props}
						index={i}
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
	createPresetMenu: func.isRequired,
	dispatch: func.isRequired
}

export default BatchList
