import React, { useCallback, useContext } from 'react'
import { arrayOf, bool, func, number, shape, string } from 'prop-types'

import { PrefsContext } from 'store'

import {
	duplicatePreset,
	moveSortableElement,
	removePreset,
	selectPresetById,
	selectPresetByIndex,
	updatePresetStateById
} from 'actions'

import { useWarning } from 'hooks'

import {
	classNameBuilder,
	detectCircularReference,
	isArrowNext,
	isArrowPrev
} from 'utilities'

import DraggableList from '../form_elements/DraggableList'
import PopupMenu from '../form_elements/PopupMenu'

const { interop } = window.ABLE2

const SelectPresetItem = ({
	focused,
	label,
	id,
	warnRemovePreset,
	createOptionsMenu,
	onKeyDown,
	dispatch
}) => {
	const selectBtnTitle = `Select ${label}`
	const removeBtnTitle = `Remove ${label}`

	const removePresetWithWarning = useCallback(() => warnRemovePreset({
		message: `${removeBtnTitle}?`,
		onConfirm() {
			dispatch(removePreset(id))
		} 
	}), [label, id, warnRemovePreset])

	return (
		<div
			className={classNameBuilder({
				'sortable-list-item': true,
				focused
			})}
			onKeyDown={e => onKeyDown(removePresetWithWarning, e)}>
			<button
				type="button"
				name="select-selectable-item"
				className="overlow-ellipsis"
				title={selectBtnTitle}
				aria-label={selectBtnTitle}
				onClick={() => dispatch(selectPresetById(id))}>{label}</button>
			<PopupMenu options={() => createOptionsMenu(removePresetWithWarning)} />
			<button
				type="button"
				name="remove-selectable-item"
				className="symbol"
				title={removeBtnTitle}
				aria-label={removeBtnTitle}
				onClick={removePresetWithWarning}>close</button>
		</div>
	)
}

const PresetSelector = ({
	presets,
	batchPresets,
	presetsLength,
	batchPresetsLength,
	dispatch
}) => {
	const { warnings } = useContext(PrefsContext).preferences

	const movePreset = useCallback((oldPos, newPos) => {
		if (newPos > presetsLength) return

		dispatch(moveSortableElement('presets', oldPos, newPos))
	}, [presetsLength])

	const moveBatchPreset = useCallback((oldPos, newPos) => {
		const offsetNewPos = newPos + presetsLength

		if (offsetNewPos < presetsLength) return

		dispatch(moveSortableElement('presets', oldPos + presetsLength, offsetNewPos))
	}, [presetsLength])

	const selectPreset = useCallback(index => {
		dispatch(selectPresetByIndex(index))
	}, [])

	const selectBatchPreset = useCallback(index => {
		selectPreset(index + presetsLength)
	}, [presetsLength])

	const dispatchDuplicatePreset = useCallback(index => {
		dispatch(duplicatePreset(index))
	}, [])

	const warnRemovePreset = useWarning({
		name: 'removePreset'
	}, [])

	const warnRemoveReferencedPreset = useWarning({
		name: 'removeReferencedPreset',
		detail: 'This preset is referenced in one or more batch presets. Deleting this preset will also delete these references. Proceed?'
	}, [])

	const getWarningType = hasReferences => hasReferences && warnings.removeReferencedPreset
		? warnRemoveReferencedPreset
		: warnRemovePreset

	const createOptionsMenu = useCallback((index, presetLength, id, type, removePreset) => {
		const isFirst = index === 0
		const isLast = index === presetLength - 1

		return [
			{
				type: 'button',
				label: 'Move Up',
				hide: isFirst,
				shortcut: '⌥↑',
				action() {
					(type === 'batchPreset' ? moveBatchPreset : movePreset)(index, index - 1)
				}
			},
			{
				type: 'button',
				label: 'Move Down',
				hide: isLast,
				shortcut: '⌥↓',
				action() {
					(type === 'batchPreset' ? moveBatchPreset : movePreset)(index, index + 2)
				}
			},
			{
				type: 'spacer',
				hide: isFirst && isLast
			},
			{
				type: 'button',
				label: 'Duplicate Preset',
				shortcut: `${interop.isMac ? '⌘' : '⌃'}D`,
				action() {
					dispatchDuplicatePreset(index)
				}
			},
			{ type: 'spacer' },
			{
				type: 'submenu',
				label: 'Add to Batch Preset',
				hide: !batchPresets.length,
				submenu: () => batchPresets
					.filter(item => !detectCircularReference(batchPresets, item.id, id))
					.map(item => ({
						type: 'button',
						label: item.label,
						action() {
							dispatch(updatePresetStateById(item.id, {
								presetIds: [...item.presetIds, id]
							}))
						}
					}))
			},
			{
				type: 'spacer',
				hide: !batchPresets.length
			},
			{
				type: 'button',
				label: 'Remove Preset',
				shortcut: '⌫',
				action: removePreset
			}
		]
	}, [batchPresets, presetsLength])

	const onKeyDown = useCallback((index, type, removePreset, e) => {
		const ctrlOrCmd = interop.isMac ? e.metaKey : e.ctrlKey

		if (e.altKey && isArrowPrev(e)) {
			e.preventDefault();
			(type === 'batchPreset' ? moveBatchPreset : movePreset)(index, index - 1)
		} else if (e.altKey && isArrowNext(e)) {
			e.preventDefault();
			(type === 'batchPreset' ? moveBatchPreset : movePreset)(index, index + 2)
		} else if (isArrowPrev(e)) {
			e.preventDefault();
			(type === 'batchPreset' ? selectBatchPreset : selectPreset)(index - 1)
		} else if (isArrowNext(e)) {
			e.preventDefault();
			(type === 'batchPreset' ? selectBatchPreset : selectPreset)(index + 1)
		} else if (ctrlOrCmd && !e.shiftKey && e.key === 'd') {
			dispatchDuplicatePreset(index)
		} else if (e.key === 'Backspace' || e.key === 'Delete') {
			removePreset()
		}
	}, [presetsLength])

	return (
		<div className="preset-selector panel">
			{presetsLength ? <>
				<h2>Presets</h2>
				<DraggableList
					sortingAction={movePreset}
					hasSharedContext>
					{presets.map(({ id, focused, label, type, hasReferences }, i) => (
						<SelectPresetItem
							key={id}
							id={id}
							focused={focused}
							label={label}
							warnRemovePreset={getWarningType(hasReferences)}
							createOptionsMenu={removePreset => createOptionsMenu(i, presetsLength, id, type, removePreset)}
							onKeyDown={(removePreset, e) => onKeyDown(i, type, removePreset, e)}
							dispatch={dispatch} />
					))}
				</DraggableList>
			</> : <></>}
			{batchPresetsLength ? <>
				<h2>Batch Presets</h2>
				<DraggableList
					sortingAction={moveBatchPreset}
					hasSharedContext>
					{batchPresets.map(({ id, focused, label, type, hasReferences }, i) => (
						<SelectPresetItem
							key={id}
							id={id}
							focused={focused}
							label={label}
							warnRemovePreset={getWarningType(hasReferences)}
							createOptionsMenu={removePreset => createOptionsMenu(i, batchPresetsLength, id, type, removePreset)}
							onKeyDown={(removePreset, e) => onKeyDown(i, type, removePreset, e)}
							dispatch={dispatch} />
					))}
				</DraggableList>
			</> : <></>}
		</div>
	)
}

const COMMON_PROP_TYPES = Object.freeze({
	id: string.isRequired,
	focused: bool.isRequired,
	label: string
})

SelectPresetItem.propTypes = {
	...COMMON_PROP_TYPES,
	warnRemovePreset: func.isRequired,
	createOptionsMenu: func.isRequired,
	onKeyDown: func.isRequired,
	dispatch: func.isRequired
}

PresetSelector.propTypes = {
	presets: arrayOf(shape(COMMON_PROP_TYPES)),
	batchPresets: arrayOf(shape(COMMON_PROP_TYPES)),
	presetsLength: number.isRequired,
	batchPresetsLength: number.isRequired,
	dispatch: func.isRequired
}

export default PresetSelector
