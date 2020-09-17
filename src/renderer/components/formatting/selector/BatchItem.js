import React from 'react'
import { bool, func, string, number } from 'prop-types'

import {
	selectMedia,
	pasteSettings,
	moveMedia,
	duplicateMedia
} from '../../../actions'

import DropdownMenu from '../../form_elements/DropdownMenu'

const { interop } = window.ABLE2

const BatchItem = props => {
	const { id, refId, title, selected, index, mediaLength, dispatch } = props
	const onlyItem = mediaLength === 1
	
	const dropdown = [
		{
			label: 'Copy All Settings',
			hide: onlyItem,
			action() {
				props.copyAllSettings(id)
			}
		},
		{
			label: 'Paste Settings',
			hide: onlyItem,
			action() {
				dispatch(pasteSettings(id))
			}
		},
		{
			label: 'Apply Settings to All',
			hide: onlyItem,
			action() {
				props.applyToAllWithWarning(id)
			}
		},
		{ role: 'spacer' },
		{
			label: 'Move Up',
			hide: onlyItem || index === 0,
			action() {
				dispatch(moveMedia(index, index - 1))
			}
		},
		{
			label: 'Move Down',
			hide: onlyItem || index + 1 === mediaLength,
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

	return (
		<div
			className={`batch-item${selected ? ' selected' : ''}`}
			onDragStart={props.dragStart}
			onDragOver={props.dragOver}
			onDragLeave={props.dragLeave}
			onDrop={props.drop}
			draggable={mediaLength > 1}>
			<DropdownMenu buttons={dropdown} />
			<button
				type="button"
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
	selected: bool,
	copyAllSettings: func.isRequired,
	applyToAllWithWarning: func.isRequired,
	removeMediaWithWarning: func.isRequired,
	dragStart: func.isRequired,
	dragOver: func.isRequired,
	dragLeave: func.isRequired,
	drop: func.isRequired,
	tempFilePath: string.isRequired,
	index: number.isRequired,
	mediaLength: number.isRequired,
	dispatch: func.isRequired
}

export default BatchItem
