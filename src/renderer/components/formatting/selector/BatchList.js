import React, { useCallback, useContext, useEffect, useRef } from 'react'
import { arrayOf, func, object, string } from 'prop-types'

import { PrefsContext } from 'store/preferences'

import {
	moveMedia,
	removeMedia,
	copySettings,
	applySettingsToAll
} from 'actions'

import {
	warn,
	arrayCount,
	createScrollbarPadder
} from 'utilities'

import DraggableList from '../../form_elements/DraggableList'
import BatchItem from './BatchItem'

const applyToAllWarning = (enabled, callback) => {
	warn({
		message: 'Apply current settings to all media items?',
		detail: 'This will overwrite the settings of all other media items in the batch except for filenames and start and end timecodes. This cannot be undone. Proceed?',
		enabled,
		callback
	})
}

const removeMediaWarning = (title, enabled, callback) => {
	warn({
		message: `Remove "${title}"?`,
		detail: 'This cannot be undone. Proceed?',
		enabled,
		callback
	})
}

export const extractSettingsToCopy = settings => {
	const { arc, background, overlay, source, centering, position, scale, crop, rotation } = settings
	return { arc, background, overlay, source, centering, position, scale, crop, rotation }
}

const scrollbarPadder = createScrollbarPadder()

const BatchList = ({ media, selectedId, dispatch }) => {
	const { warnings } = useContext(PrefsContext).preferences

	const copyAllSettings = useCallback(id => {
		dispatch(copySettings(extractSettingsToCopy(media.find(item => item.id === id))))
	}, [media])

	const applyToAllWithWarning = useCallback(id => {
		applyToAllWarning(warnings.applyToAll, () => {
			dispatch(applySettingsToAll(id, extractSettingsToCopy(media.find(item => item.id === id))))
		})
	}, [media, warnings.applyToAll])

	const removeMediaWithWarning = useCallback((id, refId, title) => {
		removeMediaWarning(title, warnings.remove, () => {
			dispatch(removeMedia({
				id,
				refId,
				references: arrayCount(media, item => item.refId === refId)
			}))
		})
	}, [media, warnings.remove])

	const sortingAction = useCallback((oldPos, newPos) => {
		dispatch(moveMedia(oldPos, newPos))
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
						applyToAllWithWarning={applyToAllWithWarning}
						removeMediaWithWarning={removeMediaWithWarning}
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
