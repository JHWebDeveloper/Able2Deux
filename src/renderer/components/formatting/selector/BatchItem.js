import React, { useCallback, useEffect, useRef } from 'react'
import { bool, func, number, object, string } from 'prop-types'

import { selectMedia } from 'actions'

import MediaOptionsDropdown from '../../form_elements/MediaOptionsDropdown'

const BatchItem = props => {
	const {
		id,
		refId,
		title,
		index,
		focused,
		anchored,
		selected,
		tempFilePath,
		removeMediaWarning,
		createDropdown,
		onKeyDown,
		dispatch
	} = props
	
	const selectMediaBtn = useRef(null)
	const selectBtnTitle = focused ? title : 'Select Media'

	const argsForParentFns = { id, refId, index, title, tempFilePath }

	const selectMediaOnClick = useCallback(e => {
		dispatch(selectMedia(index, e, { focused, anchored, selected }))
	}, [index, focused, anchored, selected])

	const selectMediaOnKeyDown = useCallback(e => {
		if (e.key === 'Enter' || e.key === 'Spacebar') {
			e.preventDefault()
			selectMediaOnClick(e)
		}
	}, [index, focused, anchored, selected])

	useEffect(() => {
		if (focused) selectMediaBtn.current.focus()
	}, [focused, index])

	return (
		<div
			className={`batch-item${selected ? ' selected' : ''}${focused ? ' focused' : ''}`}
			onKeyDown={e => onKeyDown(argsForParentFns, e)}>
			<button
				type="button"
				name="select-media"
				className="overlow-ellipsis"
				ref={selectMediaBtn}
				title={selectBtnTitle}
				aria-label={selectBtnTitle}
				onClick={selectMediaOnClick}
				onKeyDown={selectMediaOnKeyDown}>{title}</button>	
			<MediaOptionsDropdown buttons={() => createDropdown(argsForParentFns)} />
			<button
				type="button"
				title="Remove Media"
				name="remove-media"
				aria-label="Remove Media"
				className="symbol"
				onClick={() => removeMediaWarning(argsForParentFns)}>close</button>
		</div>
	)
}

BatchItem.propTypes = {
	id: string.isRequired,
	refId: string.isRequired,
	focused: bool.isRequired,
	anchored: bool.isRequired,
	selected: bool.isRequired,
	title: string.isRequired,
	tempFilePath: string.isRequired,
	index: number.isRequired,
	removeMediaWarning: func.isRequired,
	clipboard: object,
	createPresetMenu: func.isRequired,
	onKeyDown: func.isRequired,
	dispatch: func.isRequired
}

export default BatchItem
