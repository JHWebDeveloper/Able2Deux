import React, { useCallback, useRef, useEffect } from 'react'
import { bool, func, string, number } from 'prop-types'

import {
	selectMedia,
	pasteSettings,
	moveMedia,
	duplicateMedia
} from '../../../actions'

import DropdownMenu from '../../form_elements/DropdownMenu'

const { interop } = window.ABLE2

const ctrlOrCmdKey = interop.isMac ? 'metaKey' : 'ctrlKey'

const BatchItem = props => {
	const { id, refId, title, selected, index, isFirst, isLast, isOnly, dispatch } = props
	
	const dropdown = [
		{
			label: 'Copy All Settings',
			hide: isOnly,
			action() {
				props.copyAllSettings(id)
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
				props.applyToAllWithWarning(id)
			}
		},
		{ role: 'spacer' },
		{
			label: 'Move Up',
			hide: isFirst,
			action() {
				dispatch(moveMedia(index, index - 1))
			}
		},
		{
			label: 'Move Down',
			hide: isLast,
			action() {
				dispatch(moveMedia(index, index + 2))
			}
		},
		{ role: 'spacer' },
		{
			label: 'Duplicate Media',
			action() {
				dispatch(duplicateMedia(id))
			}
		},
		{
			label: 'Remove Media',
			action() {
				props.removeMediaWithWarning(id, refId, title)
			}
		},
		{ role: 'spacer' },
		{
			label: 'Reveal in Cache',
			action() {
				interop.revealInTempFolder(props.tempFilePath)
			}
		}
	]

	const onKeyDown = e => {
		if (/^(Backspace|Delete)$/.test(e.key)) {
			return props.removeMediaWithWarning(id, refId, title)
		}

		const ctrl = e[ctrlOrCmdKey]

		if (ctrl && e.key === 'd') {
			dispatch(duplicateMedia(id))
		} else if (ctrl && !isOnly && e.key === 'c') {
			props.copyAllSettings(id)
		} else if (ctrl && !isOnly && e.key === 'v') {
			dispatch(pasteSettings(id))
		} else if (ctrl && !isOnly && e.key === 'a') {
			props.applyToAllWithWarning(id)
		} else if (ctrl && !isFirst && e.key === 'ArrowUp') {
			dispatch(moveMedia(index, index - 1))
		} else if (ctrl && !isLast && e.key === 'ArrowDown') {
			dispatch(moveMedia(index, index + 2))
		} else if (!isFirst && e.key === 'ArrowUp') {
			props.selectNeighbor(index - 1)
		} else if (!isLast && e.key === 'ArrowDown') {
			props.selectNeighbor(index + 1)
		}
	}

	const ref = useRef()

	useEffect(() => {
		if (selected) ref.current.focus()
	}, [selected])

	return (
		<div
			className={`batch-item${selected ? ' selected' : ''}`}
			onKeyDown={onKeyDown}>
			<DropdownMenu buttons={dropdown} />
			<button
				type="button"
				ref={ref}
				title={selected ? title : 'Select Media'}
				onClick={() => dispatch(selectMedia(id))}>{title}</button>
			<button
				type="button"
				title="Remove Media"
				className="symbol"
				onClick={() => {
					props.removeMediaWithWarning(id, refId, title)}
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
	selected: bool.isRequired,
	isFirst: bool.isRequired,
	isLast: bool.isRequired,
	isOnly: bool.isRequired,
	copyAllSettings: func.isRequired,
	applyToAllWithWarning: func.isRequired,
	removeMediaWithWarning: func.isRequired,
	selectNeighbor: func.isRequired,
	dispatch: func.isRequired
}

export default BatchItem
