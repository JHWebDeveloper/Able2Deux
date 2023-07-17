import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { bool, func, string, number } from 'prop-types'

import {
	deselectAllMedia,
	duplicateMedia,
	duplicateSelectedMedia,
	moveSortableElement,
	pasteSettings,
	selectAllMedia,
	selectMedia
} from 'actions'

import DropdownMenu from '../../form_elements/DropdownMenu'
import MediaOptionButtons from '../../form_elements/MediaOptionButtons'

const { interop } = window.ABLE2

const ctrlOrCmdKeySymbol = interop.isMac ? '⌘' : '⌃'

const BatchItem = props => {
	const {
		id,
		refId,
		title,
		index,
		focused,
		anchored,
		selected,
		isFirst,
		isLast,
		copyAllSettings,
		applyToAllWarning,
		applyToSelectionWarning,
		removeMediaWarning,
		multipleItemsSelected,
		allItemsSelected,
		dispatch
	} = props

	const triggers = [
		title,
		index,
		copyAllSettings,
		applyToAllWarning,
		removeMediaWarning
	]

	const isOnly = isFirst && isLast
	const selectBtnTitle = focused ? title : 'Select Media'

	const selectMediaBtn = useRef(null)

	const dropdown = useMemo(() => [
		{
			label: 'Copy All Settings',
			hide: isOnly,
			shortcut: `${ctrlOrCmdKeySymbol}C`,
			action() {
				copyAllSettings(id)
			}
		},
		{
			label: 'Paste Settings',
			hide: isOnly,
			shortcut: `${ctrlOrCmdKeySymbol}V`,
			action() {
				dispatch(pasteSettings(id))
			}
		},
		{
			label: 'Apply Settings to Selected',
			hide: isOnly || !multipleItemsSelected && focused || allItemsSelected,
			action() {
				dispatch(applyToSelectionWarning(id))
			}
		},
		{
			label: 'Apply Settings to All',
			hide: isOnly,
			action() {
				applyToAllWarning(id)
			}
		},
		{ type: 'spacer' },
		{
			label: 'Move Up',
			hide: isFirst,
			shortcut: `${ctrlOrCmdKeySymbol}↑`,
			action() {
				dispatch(moveSortableElement('media', index, index - 1))
			}
		},
		{
			label: 'Move Down',
			hide: isLast,
			shortcut: `${ctrlOrCmdKeySymbol}↓`,
			action() {
				dispatch(moveSortableElement('media', index, index + 2))
			}
		},
		{ type: 'spacer' },
		{
			label: 'Duplicate Media',
			shortcut: `${ctrlOrCmdKeySymbol}D`,
			action() {
				dispatch(duplicateMedia(index))
			}
		},
		{
			label: 'Remove Media',
			shortcut: '␡',
			action() {
				removeMediaWarning({ id, refId, index, title })
			}
		},
		{ type: 'spacer' },
		{
			label: 'Reveal in Cache',
			action() {
				interop.revealInTempFolder(props.tempFilePath)
			}
		}
	], triggers)

	const onKeyDown = useCallback(e => {
		const ctrlOrCmd = interop.isMac ? e.metaKey : e.ctrlKey

		if (ctrlOrCmd && !isOnly && e.key === 'c') {
			dropdown[0].action() // Copy All Settings
		} else if (ctrlOrCmd && !isOnly && e.key === 'v') {
			dropdown[1].action() // Paste Settings
		} else if (ctrlOrCmd && !isFirst && (e.key === 'ArrowUp' || e.key === 'ArrowLeft')) {
			dropdown[5].action() // Move Up
		} else if (ctrlOrCmd && !isLast && (e.key === 'ArrowDown' || e.key === 'ArrowRight')) {
			dropdown[6].action() // Move Down
		} else if (!isFirst && (e.key === 'ArrowUp' || e.key === 'ArrowLeft')) {
			dispatch(selectMedia(index - 1, e))
		} else if (!isLast && (e.key === 'ArrowDown' || e.key === 'ArrowRight')) {
			dispatch(selectMedia(index + 1, e))
		} else if (e.shiftKey && ctrlOrCmd && e.key === 'a') {
			dispatch(deselectAllMedia())
		} else if (ctrlOrCmd && e.key === 'a') {
			dispatch(selectAllMedia())
		} else if (e.shiftKey && ctrlOrCmd && e.key === 'd') {
			dispatch(duplicateSelectedMedia())
		} else if (ctrlOrCmd && e.key === 'd') {
			dropdown[8].action() // Duplicate Media
		} else if (e.key === 'Backspace' || e.key === 'Delete') {
			dropdown[9].action() // Remove Media
		}
	}, triggers)

	const selectMediaDispatch = useCallback(e => {
		dispatch(selectMedia(index, e, { focused, anchored, selected }))
	}, [index, focused, anchored, selected])

	useEffect(() => {
		if (focused) selectMediaBtn.current.focus()
	}, [focused])

	return (
		<div
			className={`batch-item${selected ? ' selected' : ''}${focused ? ' focused' : ''}`}
			onKeyDown={onKeyDown}>
			<DropdownMenu>				
				<MediaOptionButtons buttons={dropdown} />
			</DropdownMenu>
			<button
				type="button"
				ref={selectMediaBtn}
				title={selectBtnTitle}
				aria-label={selectBtnTitle}
				onClick={selectMediaDispatch}>{title}</button>
			<button
				type="button"
				title="Remove Media"
				aria-label="Remove Media"
				className="symbol"
				onClick={() => {
					removeMediaWarning({ id, refId, index, title })}
				}>close</button>
		</div>
	)
}

BatchItem.propTypes = {
	id: string.isRequired,
	refId: string.isRequired,
	focused: bool.isRequired,
	anchored: bool.isRequired,
	selected: bool.isRequired,
	multipleItemsSelected: bool.isRequired,
	allItemsSelected: bool.isRequired,
	isFirst: bool.isRequired,
	isLast: bool.isRequired,
	title: string.isRequired,
	tempFilePath: string.isRequired,
	index: number.isRequired,
	copyAllSettings: func.isRequired,
	applyToAllWarning: func.isRequired,
	applyToSelectionWarning: func.isRequired,
	removeMediaWarning: func.isRequired,
	dispatch: func.isRequired
}

export default BatchItem
