import React, { useCallback, useContext, useMemo } from 'react'
import { arrayOf, bool, func, object } from 'prop-types'

import { PresetsContext } from 'store'

import {
	applyPreset,
	duplicateSelectedMedia,
	deselectAllMedia,
	selectAllMedia,
	removeSelectedMedia,
	removeAllMedia
} from 'actions'

import { useWarning } from 'hooks'
import { pipe } from 'utilities'

import MediaInfo from './MediaInfo'
import BatchList from './BatchList'
import MediaSelectorOptions from './MediaSelectorOptions'

const { interop } = window.ABLE2

const ctrlOrCmdKeySymbol = interop.isMac ? '⌘' : '⌃'

const mapIds = media => media.map(({ id }) => id)
const filterSelected = media => media.filter(({ selected }) => selected)

const MediaSelector = props => {
	const { media, focused, multipleItems, multipleItemsSelected, allItemsSelected, dispatch } = props
	const { presets = [], batchPresets = [] } = useContext(PresetsContext).presets
	
	const warn = useWarning({ name: 'removeAll' }, [media, allItemsSelected])

	const removeMediaWarning = useCallback(({ message, action }) => warn({
		message,
		onConfirm() {
			dispatch(action())
		}
	}), [media, allItemsSelected, warn])

	const dropdownDependencies = [media, allItemsSelected, multipleItemsSelected, warn, presets, batchPresets]

	const createPresetMenu = useCallback(action => () => [
		...presets.map(({ label, id }) => ({
			label,
			action() {
				dispatch(action(id))
			}
		})),
		{
			type: 'spacer',
			hide: !presets.length || !batchPresets.length
		},
		...batchPresets.map(({ label, presets }) => ({
			label,
			action() {
				dispatch(action(presets))
			}
		}))
	], [presets, batchPresets])

	const dropdown = useMemo(() => [
		{
			label: 'Select All',
			hide: allItemsSelected,
			shortcut: `${ctrlOrCmdKeySymbol}A`,
			action() {
				dispatch(selectAllMedia())
			}
		},
		{
			label: 'Deselect All',
			hide: !multipleItemsSelected,
			shortcut: `⇧${ctrlOrCmdKeySymbol}A`,
			action() {
				dispatch(deselectAllMedia())
			}
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
			hide: !multipleItemsSelected,
			submenu: createPresetMenu(presetIds => (
				applyPreset(presetIds, pipe(filterSelected, mapIds)(media))
			))
		},
		{
			label: 'Apply Preset to Selected as Duplicate',
			hide: !multipleItemsSelected,
			submenu: createPresetMenu(presetIds => (
				applyPreset(presetIds, pipe(filterSelected, mapIds)(media), true)
			))
		},
		{
			label: 'Apply Preset to All',
			hide: multipleItemsSelected,
			submenu: createPresetMenu(presetIds => (
				applyPreset(presetIds, mapIds(media))
			))
		},
		{
			label: 'Apply Preset to All as Duplicate',
			hide: multipleItemsSelected,
			submenu: createPresetMenu(presetIds => (
				applyPreset(presetIds, mapIds(media), true)
			))
		},
		{ type: 'spacer' },
		{
			label: 'Remove Selected',
			hide: !multipleItemsSelected,
			shortcut: '⇧⌫',
			action() {
				removeMediaWarning({
					message: 'Remove Selected Media?',
					action: () => removeSelectedMedia(!allItemsSelected)
				})
			}
		},
		{
			label: 'Remove All',
			hide: allItemsSelected,
			action() {
				removeMediaWarning({
					message: 'Remove All Media?',
					action: removeAllMedia
				})
			}
		}
	], dropdownDependencies)

	const onKeyDown = useCallback(e => {
		const ctrlOrCmd = interop.isMac ? e.metaKey : e.ctrlKey

		if (e.shiftKey && ctrlOrCmd && e.key === 'a') {
			dropdown[1].action() // Deselect All Media
		} else if (ctrlOrCmd && e.key === 'a') {
			dropdown[0].action() // Select All Media
		} else if (ctrlOrCmd && e.key === 'd') { // requires shiftKey pressed, we conditionally stopped propagation on child element for !e.shiftKey
			dropdown[3].action() // Duplicate Selected Media
		} else if (e.key === 'Backspace' || e.key === 'Delete') { // same note as above
			dropdown[5].action() // Remove Selected Media
		}
	}, dropdownDependencies)

	return (
		<div
			id="media-selector"
			className="formatting-panel"
			onKeyDown={onKeyDown}>
			<MediaInfo
				thumbnail={focused.thumbnail}
				title={focused.title}
				width={focused.originalWidth}
				height={focused.originalHeight}
				aspectRatio={focused.originalAspectRatio}
				totalFrames={focused.totalFrames}
				fps={focused.mediaType === 'video' && focused.fps}
				channelLayout={focused.channelLayout}
				sampleRate={focused.sampleRate}
				bitRate={focused.bitRate}
				dispatch={dispatch} />
			<BatchList
				media={media}
				multipleItemsSelected={multipleItemsSelected}
				allItemsSelected={allItemsSelected}
				copyToClipboard={props.copyToClipboard}
				clipboard={props.clipboard}
				createPresetMenu={createPresetMenu}
				dispatch={dispatch} />
			{multipleItems ? (
				<MediaSelectorOptions
					allItemsSelected={allItemsSelected}
					createPresetMenu={createPresetMenu}
					dropdown={dropdown} />
			) : <></>}
		</div>
	)
}

MediaSelector.propTypes = {
	media: arrayOf(object).isRequired,
	focused: object.isRequired,
	multipleItems: bool.isRequired,
	multipleItemsSelected: bool.isRequired,
	allItemsSelected: bool.isRequired,
	copyToClipboard: func.isRequired,
	clipboard: object,
	dispatch: func.isRequired
}

export default MediaSelector
