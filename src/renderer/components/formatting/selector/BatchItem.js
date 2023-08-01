import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { bool, func, number, object, string } from 'prop-types'

import {
	duplicateMedia,
	moveSortableElement,
	pasteSettings,
	selectMedia
} from 'actions'

import { refocusBatchItem } from 'utilities'

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
		prevSelected,
		nextSelected,
		copyAllSettings,
		applyToAllWarning,
		applyToSelectionWarning,
		removeMediaWarning,
		multipleItemsSelected,
		allItemsSelected,
		tempFilePath,
		clipboard,
		dispatch
	} = props

	const selectMediaBtn = useRef(null)
	const isOnly = isFirst && isLast
	const selectBtnTitle = focused ? title : 'Select Media'

	const dropdownDependencies = [
		id,
		refId,
		index,
		title,
		isFirst,
		isLast,
		prevSelected,
		nextSelected,
		multipleItemsSelected,
		allItemsSelected,
		copyAllSettings,
		applyToAllWarning,
		removeMediaWarning,
		tempFilePath
	]

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
				dispatch(pasteSettings(id, clipboard))
			}
		},
		{
			label: 'Apply Settings to Selected',
			hide: isOnly || !multipleItemsSelected,
			action() {
				dispatch(applyToSelectionWarning(id))
			}
		},
		{
			label: 'Apply Settings to All',
			hide: isOnly || allItemsSelected,
			action() {
				applyToAllWarning(id)
			}
		},
		{ type: 'spacer' },
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
			shortcut: '⌫',
			action() {
				removeMediaWarning({ id, refId, index, title })
				refocusBatchItem()
			}
		},
		{ type: 'spacer' },
		{
			label: 'Reveal in Cache',
			action() {
				interop.revealInTempFolder(tempFilePath)
			}
		}
	], dropdownDependencies)

	const onKeyDown = useCallback(e => {
		const ctrlOrCmd = interop.isMac ? e.metaKey : e.ctrlKey

		if (ctrlOrCmd && !isOnly && e.key === 'c') {
			dropdown[0].action() // Copy All Settings
		} else if (ctrlOrCmd && !isOnly && e.key === 'v') {
			dropdown[1].action() // Paste Settings
		} else if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowLeft')) {
			dropdown[5].action() // Move Up
		} else if (e.altKey && (e.key === 'ArrowDown' || e.key === 'ArrowRight')) {
			dropdown[6].action() // Move Down
		} else if ((e.key === 'ArrowUp' || e.key === 'ArrowLeft')) {
			dispatch(selectMedia(index - 1, e, {
				selected: prevSelected
			}))
		} else if ((e.key === 'ArrowDown' || e.key === 'ArrowRight')) {
			dispatch(selectMedia(index + 1, e, {
				selected: nextSelected
			}))
		} else if (ctrlOrCmd && !e.shiftKey && e.key === 'd') {
			e.stopPropagation()
			dropdown[8].action() // Duplicate Media
		} else if (!e.shiftKey && (e.key === 'Backspace' || e.ket === 'Delete')) {
			e.stopPropagation()
			dropdown[9].action() // Remove Media
		}
	}, dropdownDependencies)

	const selectMediaOnClick = useCallback(e => {
		dispatch(selectMedia(index, e, { focused, anchored, selected }))
	}, [index, focused, anchored, selected])

	const selectMediaOnKeyDown = useCallback(e => {
		if (e.key === 'Enter' || e.key === 'Spacebar') {
			e.preventDefault()
			selectMediaOnClick(e)
		}
	}, [index, focused, anchored, selected])

	useEffect(() => {
		if (focused) selectMediaBtn.current.focus()
	}, [focused, index])

	return (
		<div
			className={`batch-item${selected ? ' selected' : ''}${focused ? ' focused' : ''}`}
			onKeyDown={onKeyDown}>
			<button
				type="button"
				name="select-media"
				className="overlow-ellipsis"
				ref={selectMediaBtn}
				title={selectBtnTitle}
				aria-label={selectBtnTitle}
				onClick={selectMediaOnClick}
				onKeyDown={selectMediaOnKeyDown}>{title}</button>
			<DropdownMenu>				
				<MediaOptionButtons buttons={dropdown} />
			</DropdownMenu>
			<button
				type="button"
				title="Remove Media"
				name="remove-media"
				aria-label="Remove Media"
				className="symbol"
				onClick={dropdown[9].action}>close</button>
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
	prevSelected: bool,
	nextSelected: bool,
	title: string.isRequired,
	tempFilePath: string.isRequired,
	index: number.isRequired,
	copyAllSettings: func.isRequired,
	applyToAllWarning: func.isRequired,
	applyToSelectionWarning: func.isRequired,
	removeMediaWarning: func.isRequired,
	clipboard: object,
	dispatch: func.isRequired
}

export default BatchItem
