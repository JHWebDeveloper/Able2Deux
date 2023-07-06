import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { bool, func, string, number } from 'prop-types'

import {
	duplicateMedia,
	moveSortableElement,
	pasteSettings,
	selectMedia
} from 'actions'

import DropdownMenu from '../../form_elements/DropdownMenu'
import MediaOptionButtons from '../../form_elements/MediaOptionButtons'

const { interop } = window.ABLE2

const BatchItem = props => {
	const {
		id,
		refId,
		title,
		focused,
		selected,
		index,
		prevId,
		nextId,
		copyAllSettings,
		applyToAllWarning,
		removeMediaWarning,
		dispatch
	} = props

	const triggers = [
		title,
		index,
		prevId,
		nextId,
		copyAllSettings,
		applyToAllWarning,
		removeMediaWarning
	]

	const isOnly = !prevId && !nextId
	const selectBtnTitle = focused ? title : 'Select Media'

	const selectMediaBtn = useRef(null)

	const dropdown = useMemo(() => [
		{
			label: 'Copy All Settings',
			hide: isOnly,
			action() {
				copyAllSettings(id)
			}
		},
		{
			label: 'Paste Settings',
			hide: isOnly,
			action() {
				dispatch(pasteSettings(id))
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
			hide: !prevId,
			action() {
				dispatch(moveSortableElement('media', index, index - 1))
			}
		},
		{
			label: 'Move Down',
			hide: !nextId,
			action() {
				dispatch(moveSortableElement('media', index, index + 2))
			}
		},
		{ type: 'spacer' },
		{
			label: 'Duplicate Media',
			action() {
				dispatch(duplicateMedia(id))
			}
		},
		{
			label: 'Remove Media',
			action() {
				removeMediaWarning({ id, refId, title })
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
		} else if (ctrlOrCmd && prevId && (e.key === 'ArrowUp' || e.key === 'ArrowLeft')) {
			dropdown[4].action() // Move Up
		} else if (ctrlOrCmd && nextId && (e.key === 'ArrowDown' || e.key === 'ArrowRight')) {
			dropdown[5].action() // Move Down
		} else if (prevId && (e.key === 'ArrowUp' || e.key === 'ArrowLeft')) {
			dispatch(selectMedia(prevId))
		} else if (nextId && (e.key === 'ArrowDown' || e.key === 'ArrowRight')) {
			dispatch(selectMedia(nextId))
		} else if (ctrlOrCmd && e.key === 'd') {
			dropdown[7].action() // Duplicate Media
		} else if (e.key === 'Backspace' || e.key === 'Delete') {
			dropdown[8].action() // Remove Media
		}
	}, triggers)

	const selectMediaDispatch= useCallback(e => {
		dispatch(selectMedia(index, focused, selected, e))
	}, [index, focused, selected])

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
					removeMediaWarning({ id, refId, title })}
				}>close</button>
		</div>
	)
}

BatchItem.propTypes = {
	id: string.isRequired,
	refId: string.isRequired,
	title: string.isRequired,
	tempFilePath: string.isRequired,
	index: number.isRequired,
	focused: bool.isRequired,
	prevId: string.isRequired,
	nextId: string.isRequired,
	copyAllSettings: func.isRequired,
	applyToAllWarning: func.isRequired,
	removeMediaWarning: func.isRequired,
	dispatch: func.isRequired
}

export default BatchItem
