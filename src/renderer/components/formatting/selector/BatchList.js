import React, { useCallback, useContext } from 'react'
import { arrayOf, bool, func, object } from 'prop-types'

import { PrefsContext } from 'store'

import {
	applySettingsToAll,
	copySettings,
	disableWarningAndSave,
	moveSortableElement,
	removeMedia
} from 'actions'

import {
	arrayCount,
	copyCurveSet,
	objectPick,
	pipe,
	warn
} from 'utilities'

import DraggableList from '../../form_elements/DraggableList'
import BatchItem from './BatchItem'

const applyToAllMessage = 'Apply current settings to all media items?'
const applyToAllDetail = 'This will overwrite the settings of all other media items in the batch except for filenames and start and end timecodes. This cannot be undone. Proceed?'
const removeMediaDetail = 'This cannot be undone. Proceed?'

export const extractSettingsToCopy = (() => {
	const keys = ['arc', 'background', 'overlay', 'source', 'centering', 'position', 'scale', 'crop', 'rotation', 'keying', 'colorCurves', 'audio']

	return ({ ...settings }) => {
		const isAudio = settings.mediaType === 'audio' || settings.audio.exportAs === 'audio'

		if (!isAudio) {
			settings.colorCurves = copyCurveSet(settings.colorCurves)
		}

		return objectPick(settings, isAudio ? keys.slice(-1) : keys)
	}
})()

const BatchList = ({ media, dispatch }) => {
	const { preferences, dispatch: dispatchPrefs } = useContext(PrefsContext)
	const warnings = preferences

	const copyAllSettings = useCallback(id => {
		pipe(extractSettingsToCopy, copySettings, dispatch)(media.find(item => item.id === id))
	}, [media])

	const applyToAllWarning = useCallback(id => warn({
		message: applyToAllMessage,
		detail: applyToAllDetail,
		enabled: warnings.applyToAll,
		callback() {
			pipe(extractSettingsToCopy, applySettingsToAll(id), dispatch)(media.find(item => item.id === id))
		},
		checkboxCallback() {
			dispatchPrefs(disableWarningAndSave('applyToAll'))
		}
	}), [media, warnings.applyToAll])

	const removeMediaWarning = useCallback(({ id, refId, index, title }) => warn({
		message: `Remove "${title}"?`,
		detail: removeMediaDetail,
		enabled: warnings.remove,
		callback() {
			dispatch(removeMedia({
				id,
				refId,
				index,
				references: arrayCount(media, item => item.refId === refId)
			}))
		},
		checkboxCallback() {
			dispatchPrefs(disableWarningAndSave('remove'))
		}
	}), [media, warnings.remove])

	const sortingAction = useCallback((oldPos, newPos) => {
		dispatch(moveSortableElement('media', oldPos, newPos))
	}, [])

	return (
		<div>
			<DraggableList sortingAction={sortingAction}>
				{media.map(({ id, refId, focused, anchored, selected, title, tempFilePath }, i) => (
					<BatchItem
						key={id}
						id={id}
						refId={refId}
						title={title}
						tempFilePath={tempFilePath}
						focused={focused}
						anchored={anchored}
						selected={selected}
						index={i}
						isFirst={i === 0}
						isLast={i === media.length - 1}
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
	dispatch: func.isRequired
}

export default BatchList
