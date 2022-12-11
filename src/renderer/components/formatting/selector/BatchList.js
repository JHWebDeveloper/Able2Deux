import React, { useCallback, useContext, useEffect, useRef } from 'react'
import { arrayOf, func, object, string } from 'prop-types'

import { PrefsContext } from 'store/preferences'

import {
	moveSortableElement,
	removeMedia,
	copySettings,
	applySettingsToAll,
	disableWarningAndSave
} from 'actions'

import {
	warn,
	arrayCount,
	createScrollbarPadder
} from 'utilities'

import DraggableList from '../../form_elements/DraggableList'
import BatchItem from './BatchItem'

const applyToAllMessage = 'Apply current settings to all media items?'
const applyToAllDetail = 'This will overwrite the settings of all other media items in the batch except for filenames and start and end timecodes. This cannot be undone. Proceed?'
const removeMediaDetail = 'This cannot be undone. Proceed?'

export const extractSettingsToCopy = settings => {
	const { audio, arc, background, overlay, source, centering, position, scale, crop, rotation } = settings
	return { audio, arc, background, overlay, source, centering, position, scale, crop, rotation }
}

const scrollbarPadder = createScrollbarPadder()

const BatchList = ({ media, selectedId, dispatch }) => {
	const prefsCtx = useContext(PrefsContext)
	const prefsDispatch = prefsCtx.dispatch
	const prefs = prefsCtx.preferences

	const copyAllSettings = useCallback(id => {
		dispatch(copySettings(extractSettingsToCopy(media.find(item => item.id === id))))
	}, [media])

	const applyToAllWarning = useCallback(id => warn({
		message: applyToAllMessage,
		detail: applyToAllDetail,
		enabled: prefs.warnings.applyToAll,
		callback() {
			dispatch(applySettingsToAll(id, extractSettingsToCopy(media.find(item => item.id === id))))
		},
		checkboxCallback() {
			prefsDispatch(disableWarningAndSave('applyToAll'))
		}
	}), [media, prefs.warnings.applyToAll])

	const removeMediaWarning = useCallback(({ id, refId, title }) => warn({
		message: `Remove "${title}"?`,
		detail: removeMediaDetail,
		enabled: prefs.warnings.remove,
		callback() {
			dispatch(removeMedia({
				id,
				refId,
				references: arrayCount(media, item => item.refId === refId)
			}))
		},
		checkboxCallback() {
			prefsDispatch(disableWarningAndSave('remove'))
		}
	}), [media, prefs.warnings.remove])

	const sortingAction = useCallback((oldPos, newPos) => {
		dispatch(moveSortableElement('media', oldPos, newPos))
	}, [])

	const ref = useRef()

	useEffect(() => {
		scrollbarPadder.observe(ref.current, 3)

		return () => {
			scrollbarPadder.disconnect()
		}
	}, [])

	return (
		<div ref={ref}>
			<DraggableList sortingAction={sortingAction}>
				{media.map(({ id, refId, title, tempFilePath }, i) => (
					<BatchItem
						key={id}
						id={id}
						refId={refId}
						title={title}
						tempFilePath={tempFilePath}
						selected={selectedId === id}
						index={i}
						prevId={media[i - 1]?.id || ''}
						nextId={media[i + 1]?.id || ''}
						copyAllSettings={copyAllSettings}
						applyToAllWarning={applyToAllWarning}
						removeMediaWarning={removeMediaWarning}
						dispatch={dispatch} />
				))}
			</DraggableList>
		</div>
	)
}

BatchList.propTypes = {
	media: arrayOf(object).isRequired,
	selectedId: string,
	dispatch: func.isRequired
}

export default BatchList
