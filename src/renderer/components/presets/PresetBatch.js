import React, { useCallback, useContext, useEffect, useId } from 'react'
import { arrayOf, bool, func, number, string } from 'prop-types'

import { PresetsContext } from 'store'

import {
	addPresetToBatch,
	flattenBatchPreset,
	selectPresetById,
	movePresetInBatch,
	updatePresetStateBySelection
} from 'actions'

import { useWarning } from 'hooks'

import {
	classNameBuilder,
	focusSelectableItem,
	isArrowNext,
	isArrowPrev
} from 'utilities'

import DraggableList from '../form_elements/DraggableList'
import PopupMenu from '../form_elements/PopupMenu'

const PresetBatchItem = ({
	id,
	index,
	focused,
	label,
	parentLabel,
	warnRemovePresetFromBatch,
	removePresetFromBatch,
	selectPreset,
	selectSourcePreset,
	createOptionsMenu,
	onKeyDown
}) => {
	const removeBtnTitle = `Remove ${label} from ${parentLabel}`

	const removePreset = useCallback(() => warnRemovePresetFromBatch({
		message: `${removeBtnTitle}?`,
		onConfirm() {
			removePresetFromBatch(index)
		}
	}), [label, parentLabel, warnRemovePresetFromBatch, removePresetFromBatch])

	return (
		<div
			className={classNameBuilder({
				'sortable-list-item': true,
				focused
			})}
			onKeyDown={e => onKeyDown(removePreset, e)}>
			<button
				type="button"
				name="select-selectable-item"
				className="overlow-ellipsis"
				onClick={() => selectPreset(index)}
				onDoubleClick={() => selectSourcePreset(id)}>{label}</button>
			<PopupMenu options={() => createOptionsMenu(removePreset)} />
			<button
				type="button"
				name="remove-selectable-item"
				className="symbol"
				title={removeBtnTitle}
				aria-label={removeBtnTitle}
				onClick={removePreset}>close</button>
		</div>
	)
}

const PresetBatch = ({ id, focusedIndex, setFocusedIndex, presetIds, label, dispatch }) => {
	const { presets } = useContext(PresetsContext).presets
	const setKey = useId()
	const presetIdsLength = presetIds.length

	const dispatchAddPresetToBatch = useCallback((index, preset) => {
		dispatch(addPresetToBatch(index, id, preset.id))
	}, [id])

	const removePresetFromBatch = useCallback(index => {
		dispatch(updatePresetStateBySelection({
			presetIds: presetIds.toSpliced(index, 1)
		}))
	}, [presetIds])

	const movePreset = useCallback((oldPos, newPos) => {
		dispatch(movePresetInBatch(oldPos, newPos))

		setFocusedIndex(currentIndex => {
			if (oldPos === currentIndex) {
				return newPos > oldPos ? newPos - 1 : newPos
			} else {
				return currentIndex + (newPos > currentIndex ? -1 : 1)
			}
		})
	}, [])

	const selectPreset = useCallback(index => {
		setFocusedIndex(index < 0 ? presetIdsLength - 1 : index >= presetIdsLength ? 0 : index)
	}, [presetIdsLength])

	const selectSourcePreset = useCallback(clickedId => {
		dispatch(selectPresetById(clickedId))
	}, [])

	const warnRemovePresetFromBatch = useWarning({
		name: 'removePresetFromBatch'
	})

	const createOptionsMenu = useCallback((index, clickedId, type, removePreset) => {
		const isFirst = index === 0
		const isLast = index === presetIds.length - 1

		return [
			{
				type: 'button',
				label: 'Move Up',
				hide: isFirst,
				shortcut: '⌥↑',
				action() {
					movePreset(index, index - 1)
				}
			},
			{
				type: 'button',
				label: 'Move Down',
				hide: isLast,
				shortcut: '⌥↓',
				action() {
					movePreset(index, index + 2)
				}
			},
			{
				type: 'spacer',
				hide: isFirst && isLast
			},
			{
				type: 'button',
				label: 'Reveal',
				action() {
					selectSourcePreset(clickedId)
				}
			},
			{
				type: 'button',
				label: 'Flatten Batch',
				hide: type !== 'batchPreset',
				action() {
					dispatch(flattenBatchPreset(id, clickedId))
				}
			},
			{ type: 'spacer' },
			{
				type: 'button',
				label: 'Remove from Batch',
				shortcut: '⌫',
				action: removePreset
			}
		]
	}, [presetIds.length])

	const onKeyDown = useCallback((index, removePreset, e) => {
		if (e.altKey && isArrowPrev(e)) {
			e.preventDefault()
			movePreset(index, index - 1)
		} else if (e.altKey && isArrowNext(e)) {
			e.preventDefault()
			movePreset(index, index + 2)
		} else if (isArrowPrev(e)) {
			e.preventDefault()
			selectPreset(index - 1)
		} else if (isArrowNext(e)) {
			e.preventDefault()
			selectPreset(index + 1)
		} else if (e.key === 'Backspace' || e.key === 'Delete') {
			removePreset()
		}
	})

	useEffect(() => {
		if (!presetIdsLength) return

		if (focusedIndex >= presetIdsLength) {
			setFocusedIndex(presetIdsLength - 1)
		} else if (focusedIndex < 0) {
			setFocusedIndex(0)
		}

		focusSelectableItem('.preset-batch-selector')
	}, [focusedIndex, presetIds])

	return (
		<div className="nav-panel-flex preset-batch-selector">
			<DraggableList
				sortingAction={movePreset}
				addAction={dispatchAddPresetToBatch}
				startMessage="Drag and drop Presets or Batch Presets here"
				allowCrossTableDrops
				hasSharedContext>
				{presetIds.map((presetId, i) => {
					const { label: childLabel, type } = presets.find(({ id }) => id === presetId)

					return (
						<PresetBatchItem
							key={`${setKey}_${i}`}
							id={presetId}
							index={i}
							focused={i === focusedIndex}
							label={childLabel}
							parentLabel={label}
							warnRemovePresetFromBatch={warnRemovePresetFromBatch}
							removePresetFromBatch={removePresetFromBatch}
							selectPreset={selectPreset}
							selectSourcePreset={selectSourcePreset}
							createOptionsMenu={removePreset => createOptionsMenu(i, presetId, type, removePreset)}
							onKeyDown={(removePreset, e) => onKeyDown(i, removePreset, e)} />
					)
				})}
			</DraggableList>
		</div>
	)
}

const COMMON_PROP_TYPES = Object.freeze({
	id: string.isRequired,
	label: string
})

PresetBatchItem.propTypes = {
	...COMMON_PROP_TYPES,
	index: number.isRequired,
	focused: bool.isRequired,
	parentLabel: string,
	warnRemovePresetFromBatch: func.isRequired,
	removePresetFromBatch: func.isRequired,
	selectPreset: func.isRequired,
	selectSourcePreset: func.isRequired,
	createOptionsMenu: func.isRequired,
	onKeyDown: func.isRequired
}

PresetBatch.propTypes = {
	...COMMON_PROP_TYPES,
	focusedIndex: number.isRequired,
	presetIds: arrayOf(string),
	setFocusedIndex: func.isRequired,
	dispatch: func.isRequired
}

export default PresetBatch
