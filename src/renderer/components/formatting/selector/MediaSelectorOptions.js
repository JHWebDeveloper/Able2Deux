import React, { useCallback } from 'react'
import { bool, func } from 'prop-types'

import { applyPresetToSelected, duplicateSelectedMedia } from 'actions'

import MediaOptionsDropdown from '../../form_elements/MediaOptionsDropdown.js'
import ButtonWithIcon from '../../form_elements/ButtonWithIcon.js'

const { interop } = window.ABLE2

const STYLE_INCREASE_ICON_SIZE = Object.freeze({
	scale: '1.35',
	translate: '0 -10%'
})

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
	const createDropdown = useCallback(() => {
		const ctrlOrCmdKeySymbol = interop.isMac ? '⌘' : '⌃'

		return [
			{
				type: 'button',
				label: 'Select All',
				hide: allItemsSelected,
				shortcut: `${ctrlOrCmdKeySymbol}A`,
				action: selectAllMedia
			},
			{
				type: 'button',
				label: 'Deselect All',
				hide: !multipleItemsSelected,
				shortcut: `⇧${ctrlOrCmdKeySymbol}A`,
				action: deselectAllMedia
			},
			{ type: 'spacer' },
			{
				type: 'button',
				label: 'Duplicate Selected',
				hide: !multipleItemsSelected,
				shortcut: `⇧${ctrlOrCmdKeySymbol}D`,
				action() {
					dispatch(duplicateSelectedMedia())
				}
			},
			{
				type: 'button',
				label: 'Duplicate All',
				hide: multipleItemsSelected,
				action() {
					dispatch(duplicateSelectedMedia(true))
				}
			},
			{ type: 'spacer' },
			{
				type: 'submenu',
				label: 'Apply Preset to Selected',
				hide: !showApplyPresetOptions || !multipleItemsSelected,
				submenu: createPresetMenu(presetId => applyPresetToSelected({ presetId }))
			},
			{
				type: 'submenu',
				label: 'Apply Preset to Selected as Duplicate',
				hide: !showApplyPresetOptions || !multipleItemsSelected,
				submenu: createPresetMenu(presetId => applyPresetToSelected({ presetId, duplicate: true }))
			},
			{
				type: 'submenu',
				label: 'Apply Preset to All',
				hide: !showApplyPresetOptions || multipleItemsSelected,
				submenu: createPresetMenu(presetId => applyPresetToSelected({ presetId, applyToAll: true }))
			},
			{
				type: 'submenu',
				label: 'Apply Preset to All as Duplicate',
				hide: !showApplyPresetOptions || multipleItemsSelected,
				submenu: createPresetMenu(presetIds => applyPresetToSelected({ presetIds, applyToAll: true, duplicate: true }))
			},
			{
				type: 'spacer',
				hide: !showApplyPresetOptions
			},
			{
				type: 'button',
				label: 'Remove Selected',
				hide: !multipleItemsSelected,
				shortcut: '⇧⌫',
				action: removeSelectedMediaWarning
			},
			{
				type: 'button',
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
			<MediaOptionsDropdown buttons={createDropdown} />
			{allItemsSelected ? (
				<ButtonWithIcon
					label="Deselect All"
					icon="remove_done"
					onClick={deselectAllMedia}
					iconStyle={STYLE_INCREASE_ICON_SIZE} />
			) : (
				<ButtonWithIcon
					label="Select All"
					icon="done_all"
					onClick={selectAllMedia}
					iconStyle={STYLE_INCREASE_ICON_SIZE} />
			)}
		</div>
	)
}

MediaSelectorOptions.propTypes = {
	allItemsSelected: bool.isRequired,
	multipleItemsSelected: bool.isRequired,
	showApplyPresetOptions: bool.isRequired,
	createPresetMenu: func.isRequired,
	selectAllMedia: func.isRequired,
	deselectAllMedia: func.isRequired,
	removeSelectedMediaWarning: func.isRequired,
	removeAllMediaWarning: func.isRequired,
	dispatch: func.isRequired
}

export default MediaSelectorOptions
