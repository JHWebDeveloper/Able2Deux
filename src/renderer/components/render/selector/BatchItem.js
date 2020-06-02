import React from 'react'
import { bool, func, string } from 'prop-types'

import { selectMedia, pasteSettings, duplicateMedia } from '../../../actions/render'

import DropdownMenu from '../../form_elements/DropdownMenu'

const { interop } = window.ABLE2

const BatchItem = props => {
	const { id, refId, title, selected, onlyItem, dispatch } = props
	
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
		<div className={`batch-item${selected ? ' selected' : ''}`}>
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
	onlyItem: bool.isRequired,
	refId: string.isRequired,
	title: string.isRequired,
	selected: bool,
	copyAllSettings: func.isRequired,
	applyToAllWithWarning: func.isRequired,
	removeMediaWithWarning: func.isRequired,
	tempFilePath: string.isRequired,
	dispatch: func.isRequired
}

export default BatchItem
