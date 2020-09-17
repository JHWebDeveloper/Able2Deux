import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { arrayOf, func, object, string } from 'prop-types'

import { PrefsContext } from '../../../store/preferences'

import {
	moveMedia,
	removeMedia,
	copySettings,
	applySettingsToAll
} from '../../../actions'

import { warn, extractSettings, arrayCount } from '../../../utilities'
import { ScrollbarPadder } from '../../../constructors'

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

	const [ dragging, setDragging ] = useState(false)

	const dragStart = useCallback((i, e) => {
		e.dataTransfer.setData('insert', i)
		setDragging(true)
	}, [])

	const dragOver = useCallback(e => {
		e.preventDefault()
		if (dragging) e.currentTarget.classList.add('drag-enter')
	}, [dragging])

	const dragLeave = useCallback(e => {
		e.currentTarget.classList.remove('drag-enter')
	}, [])

	const drop = useCallback((i, e) => {
		e.preventDefault()
		dispatch(moveMedia(e.dataTransfer.getData('insert'), i))
		dragLeave(e)
		setDragging(false)
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
					dragStart={e => dragStart(i, e)}
					dragOver={dragOver}
					dragLeave={dragLeave}
					drop={e => drop(i, e)}
					index={i}
					mediaLength={media.length}
					dispatch={dispatch} />
			))}
			{media.length > 1 && (
				<span
					className="insert-last"
					onDragOver={dragOver}
					onDragLeave={dragLeave}
					onDrop={e => drop(media.length, e)}></span>
			)}
		</div>
	)
}

BatchList.propTypes = {
	media: arrayOf(object).isRequired,
	selectedId: string,
	dispatch: func.isRequired
}

export default BatchList
