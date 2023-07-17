import React, { useCallback, useContext, useMemo } from 'react'
import { arrayOf, bool, func, object } from 'prop-types'

import { PrefsContext } from 'store'

import {
	disableWarningAndSave,
	deselectAllMedia,
	duplicateSelectedMedia,
	selectAllMedia,
	removeAllMedia,
	removeSelectedMedia
} from 'actions'

import { warn } from 'utilities'

import DropdownMenu from '../../form_elements/DropdownMenu.js'
import MediaOptionButtons from '../../form_elements/MediaOptionButtons'

const MediaSelectorOptions = ({ media, allItemsSelected, multipleItemsSelected, dispatch }) => {
	const { preferences, dispatch: dispatchPrefs } = useContext(PrefsContext)
	const { warnings } = preferences

	const dispatchSelectAllMedia = useCallback(() => {
		dispatch(selectAllMedia())
	}, [])

	const dispatchDeselectAllMedia = useCallback(() => {
		dispatch(deselectAllMedia())
	}, [])

	const removeMediaWarning = useCallback(({ message, action }) => warn({
		message,
		detail: 'This cannot be undone. Proceed?',
		enabled: warnings.removeAll,
		callback() {
			dispatch(action())
		},
		checkboxCallback() {
			dispatchPrefs(disableWarningAndSave('removeAll'))
		}
	}), [media, warnings.removeAll])

	const settingsMenu = useMemo(() => [
		{
			label: 'Select All',
			hide: allItemsSelected,
			action: dispatchSelectAllMedia
		},
		{
			label: 'Deselect All',
			hide: !multipleItemsSelected,
			action: dispatchDeselectAllMedia
		},
		{ type: 'spacer' },
		{
			label: 'Duplicate Selected',
			hide: !multipleItemsSelected,
			action() {
				dispatch(duplicateSelectedMedia())
			}
		},
		{ type: 'spacer' },
		{
			label: 'Remove Selected',
			hide: !multipleItemsSelected || allItemsSelected,
			action() {
				dispatch(removeMediaWarning({
					message: 'Remove Selected Media?',
					action: removeSelectedMedia
				}))
			}
		},
		{
			label: 'Remove All',
			action() {
				dispatch(removeMediaWarning({
					message: 'Remove All Media?',
					action: removeAllMedia
				}))
			}
		}
	], [media, allItemsSelected, multipleItemsSelected])

	return (
		<div>
			<DropdownMenu>
				<MediaOptionButtons buttons={settingsMenu} />
			</DropdownMenu>
			{allItemsSelected ? (
				<button
					type="button"
					name="deselectAll"
					className="app-button"
					onClick={dispatchDeselectAllMedia}>Deselect All</button>
			) : (
				<button
					type="button"
					name="selectAll"
					className="app-button"
					onClick={dispatchSelectAllMedia}>Select All</button>
			)}
		</div>
	)
}

MediaSelectorOptions.propTypes = {
	media: arrayOf(object).isRequired,
	multipleItemsSelected: bool.isRequired,
	allItemsSelected: bool.isRequired,
	dispatch: func.isRequired
}

export default MediaSelectorOptions
