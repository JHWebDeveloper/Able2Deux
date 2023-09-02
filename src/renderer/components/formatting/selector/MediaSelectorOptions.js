import React, { useCallback } from 'react'
import { arrayOf, bool, func, shape, string } from 'prop-types'

import { applyPresetToSelected, duplicateSelectedMedia }  from 'actions'

import MediaOptionsDropdown from '../../form_elements/MediaOptionsDropdown.js'

const { interop } = window.ABLE2

const MediaSelectorOptions = ({
	allItemsSelected,
	multipleItemsSelected,
	createPresetMenu,
	showApplyPresetOptions,
	selectAllMedia,
	deselectAllMedia,
	removeSelectedMediaWarning,
	removeAllMediaWarning,
	dispatch
}) => {
	const dropdown = useCallback(() => {
		const ctrlOrCmdKeySymbol = interop.isMac ? '⌘' : '⌃'

		return [
			{
				label: 'Select All',
				hide: allItemsSelected,
				shortcut: `${ctrlOrCmdKeySymbol}A`,
				action: selectAllMedia
			},
			{
				label: 'Deselect All',
				hide: !multipleItemsSelected,
				shortcut: `⇧${ctrlOrCmdKeySymbol}A`,
				action: deselectAllMedia
			},
			{ type: 'spacer' },
			{
				label: 'Duplicate Selected',
				hide: !multipleItemsSelected,
				shortcut: `⇧${ctrlOrCmdKeySymbol}D`,
				action() {
					dispatch(duplicateSelectedMedia())
				}
			},
			{
				label: 'Duplicate All',
				hide: multipleItemsSelected,
				action() {
					dispatch(duplicateSelectedMedia(true))
				}
			},
			{ type: 'spacer' },
			{
				label: 'Apply Preset to Selected',
				hide: !showApplyPresetOptions || !multipleItemsSelected,
				submenu: createPresetMenu(presetIds => applyPresetToSelected({ presetIds }))
			},
			{
				label: 'Apply Preset to Selected as Duplicate',
				hide: !showApplyPresetOptions || !multipleItemsSelected,
				submenu: createPresetMenu(presetIds => applyPresetToSelected({ presetIds, duplicate: true }))
			},
			{
				label: 'Apply Preset to All',
				hide: !showApplyPresetOptions || multipleItemsSelected,
				submenu: createPresetMenu(presetIds => applyPresetToSelected({ presetIds, applyToAll: true }))
			},
			{
				label: 'Apply Preset to All as Duplicate',
				hide: !showApplyPresetOptions || multipleItemsSelected,
				submenu: createPresetMenu(presetIds => applyPresetToSelected({ presetIds, applyToAll: true, duplicate: true }))
			},
			{
				type: 'spacer',
				hide: !showApplyPresetOptions
			},
			{
				label: 'Remove Selected',
				hide: !multipleItemsSelected,
				shortcut: '⇧⌫',
				action: removeSelectedMediaWarning
			},
			{
				label: 'Remove All',
				hide: allItemsSelected,
				action: removeAllMediaWarning
			}
		]
	}, [
		allItemsSelected,
		multipleItemsSelected,
		createPresetMenu
	])

	return (
		<div>
			<MediaOptionsDropdown buttons={dropdown} />
			{allItemsSelected ? (
				<button
					type="button"
					name="deselectAll"
					className="app-button"
					onClick={deselectAllMedia}>Deselect All</button>
			) : (
				<button
					type="button"
					name="selectAll"
					className="app-button"
					onClick={selectAllMedia}>Select All</button>
			)}
		</div>
	)
}

MediaSelectorOptions.propTypes = {
	allItemsSelected: bool.isRequired,
	dropdown: arrayOf(shape({
		type: string,
		label: string,
		hide: bool,
		shortcut: string,
		action: func
	})).isRequired
}

export default MediaSelectorOptions
