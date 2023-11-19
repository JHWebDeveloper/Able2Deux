import React, { useCallback, useContext, useMemo } from 'react'
import { arrayOf, bool, func, object } from 'prop-types'

import { PresetsContext } from 'store'

import {
	duplicateSelectedMedia,
	deselectAllMedia,
	selectAllMedia,
	removeSelectedMedia,
	removeAllMedia
} from 'actions'

import { useWarning } from 'hooks'

import MediaInfo from './MediaInfo'
import BatchList from './BatchList'
import MediaSelectorOptions from './MediaSelectorOptions'

const { interop } = window.ABLE2

const MediaSelector = ({
	media,
	focused,
	multipleItems,
	multipleItemsSelected,
	allItemsSelected,
	clipboard,
	dispatch
}) => {
	const { presets = [], batchPresets = [] } = useContext(PresetsContext).presets

	const warn = useWarning({ name: 'removeAll' }, [allItemsSelected])

	const removeMediaWarning = useCallback(({ message, action }) => warn({
		message,
		onConfirm() {
			dispatch(action())
		}
	}), [allItemsSelected])

	const removeSelectedMediaWarning = useCallback(() => removeMediaWarning({
		message: 'Remove Selected Media?',
		action: removeSelectedMedia
	}), [allItemsSelected])

	const removeAllMediaWarning = useCallback(() => removeMediaWarning({
		message: 'Remove All Media?',
		action: removeAllMedia
	}), [allItemsSelected])

	const createPresetMenu = useCallback(action => () => [
		{
			type: 'spacer',
			label: 'Presets',
			hide: !presets.length || !batchPresets.length
		},
		...presets.map(({ label, id }) => ({
			type: 'button',
			label,
			action() {
				dispatch(action(id))
			}
		})),
		{
			type: 'spacer',
			label: 'Batch Presets',
			hide: !presets.length || !batchPresets.length
		},
		...batchPresets.map(({ label, id }) => ({
			type: 'button',
			label,
			action() {
				dispatch(action(id))
			}
		})),
		{ type: 'spacer' },
		{
			type: 'button',
			label: 'Edit Presets',
			action: interop.openPresets
		}
	], [presets, batchPresets])

	const showApplyPresetOptions = useMemo(() => !!(presets.length || batchPresets.length), [presets, batchPresets])

	const dispatchDeselectAllMedia = useCallback(() => {
		dispatch(deselectAllMedia())
	}, [])

	const dispatchSelectAllMedia = useCallback(() => {
		dispatch(selectAllMedia())
	}, [])

	const onKeyDown = useCallback(e => {
		const ctrlOrCmd = interop.isMac ? e.metaKey : e.ctrlKey

		if (e.shiftKey && ctrlOrCmd && e.key === 'a') {
			dispatchDeselectAllMedia()
		} else if (ctrlOrCmd && e.key === 'a') {
			dispatchSelectAllMedia()
		} else if (ctrlOrCmd && e.key === 'd') { // requires shiftKey pressed, we conditionally stopped propagation on child element for !e.shiftKey
			dispatch(duplicateSelectedMedia(!multipleItemsSelected))
		} else if (e.key === 'Backspace' || e.key === 'Delete') { // same note as above
			removeSelectedMediaWarning()
		}
	}, [allItemsSelected, multipleItemsSelected])

	return (
		<div
			id="media-selector"
			className="panel"
			onKeyDown={onKeyDown}>
			<MediaInfo
				refId={focused.refId}
				mediaType={focused.mediaType}
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
				clipboard={clipboard}
				createPresetMenu={createPresetMenu}
				showApplyPresetOptions={showApplyPresetOptions}
				dispatch={dispatch} />
			{multipleItems ? (
				<MediaSelectorOptions
					allItemsSelected={allItemsSelected}
					multipleItemsSelected={multipleItemsSelected}
					createPresetMenu={createPresetMenu}
					showApplyPresetOptions={showApplyPresetOptions}
					selectAllMedia={dispatchSelectAllMedia}
					deselectAllMedia={dispatchDeselectAllMedia}
					removeSelectedMediaWarning={removeSelectedMediaWarning}
					removeAllMediaWarning={removeAllMediaWarning}
					dispatch={dispatch} />
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
	clipboard: object,
	dispatch: func.isRequired
}

export default MediaSelector
