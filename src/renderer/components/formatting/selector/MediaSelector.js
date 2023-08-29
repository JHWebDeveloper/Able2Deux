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

const MediaSelector = props => {
	const { media, focused, multipleItems, multipleItemsSelected, allItemsSelected, dispatch } = props
	const { presets = [], batchPresets = [] } = useContext(PresetsContext).presets
	
	const warn = useWarning({ name: 'removeAll' }, [media, allItemsSelected])

	const removeMediaWarning = useCallback(({ message, action }) => warn({
		message,
		onConfirm() {
			dispatch(action())
		}
	}), [warn])

	const removeSelectedMediaWarning = useCallback(() => removeMediaWarning({
		message: 'Remove Selected Media?',
		action: () => removeSelectedMedia(!allItemsSelected)
	}), [removeMediaWarning])

	const removeAllMediaWarning = useCallback(() => removeMediaWarning({
		message: 'Remove All Media?',
		action: removeAllMedia
	}), [removeMediaWarning])

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
	}, [removeSelectedMediaWarning, multipleItemsSelected])

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
					multipleItemsSelected={multipleItemsSelected}
					createPresetMenu={createPresetMenu}
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
	copyToClipboard: func.isRequired,
	clipboard: object,
	dispatch: func.isRequired
}

export default MediaSelector
