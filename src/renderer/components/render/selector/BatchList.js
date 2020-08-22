import React, { useCallback, useContext, useEffect, useRef } from 'react'
import { arrayOf, func, object, string } from 'prop-types'

import { PrefsContext } from '../../../store/preferences'
import { removeMedia } from '../../../actions/acquisition'
import { copySettings, applySettingsToAll } from '../../../actions/render'
import { warn, extractSettings, arrayCount, ScrollbarPadder } from '../../../utilities'

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

const scrollbarPadder = new ScrollbarPadder()

const BatchList = ({ media, selectedId, dispatch }) => {
	const { warnings } = useContext(PrefsContext).preferences

	const copyAllSettings = useCallback(id => {
		dispatch(copySettings(extractSettings(media.find(item => item.id === id))))
	}, [media])

	const applyToAllWithWarning = useCallback(id => {
		applyToAllWarning(warnings.applyToAll, () => {
			dispatch(applySettingsToAll(id, extractSettings(media.find(item => item.id === id))))
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

	const ref = useRef()

	useEffect(() => {
		scrollbarPadder.observe(ref.current, 3)

		return () => {
			scrollbarPadder.disconnect()
		}
	}, [])

	return (
		<div ref={ref}>
			{media.map(({ id, refId, title, tempFilePath }, i) => (
				<BatchItem
					key={id}
					id={id}
					refId={refId}
					title={title}
					tempFilePath={tempFilePath}
					selected={selectedId === id}
					copyAllSettings={copyAllSettings}
					applyToAllWithWarning={applyToAllWithWarning}
					removeMediaWithWarning={removeMediaWithWarning}
					index={i}
					mediaLength={media.length}
					dispatch={dispatch} />
			))}
		</div>
	)
}

BatchList.propTypes = {
	media: arrayOf(object).isRequired,
	selectedId: string,
	dispatch: func.isRequired
}

export default BatchList
