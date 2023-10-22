import React, { useCallback, useEffect, useRef } from 'react'
import { bool, func, number, string } from 'prop-types'

import { removeMedia, selectMedia } from 'actions'
import { classNameBuilder, refocusBatchItem } from 'utilities'

import MediaOptionsDropdown from '../../form_elements/MediaOptionsDropdown'

const BatchItem = ({
	index,
	id,
	title,
	focused,
	anchored,
	selected,
	warnRemoveMedia,
	createDropdown,
	onKeyDown,
	dispatch
}) => {
	const selectMediaBtn = useRef(null)
	const selectBtnTitle = `Select ${title}`
	const removeBtnTitle = `Remove ${title}`

	const selectMediaOnClick = useCallback(e => {
		dispatch(selectMedia(index, e, { focused, anchored, selected }))
	}, [index, focused, anchored, selected])

	const selectMediaOnKeyDown = useCallback(e => {
		if (e.key === 'Enter' || e.key === 'Spacebar') {
			e.preventDefault()
			selectMediaOnClick(e)
		}
	}, [index, focused, anchored, selected])

	const removeMediaWarning = useCallback(() => warnRemoveMedia({
		message: `${removeBtnTitle}?`,
		onConfirm() {
			dispatch(removeMedia({ id, index }))
			refocusBatchItem()
		}
	}), [title, id, index, warnRemoveMedia])

	useEffect(() => {
		if (focused) selectMediaBtn.current.focus()
	}, [focused, index])

	return (
		<div
			className={classNameBuilder({
				'sortable-list-item': true,
				selected,
				focused
			})}
			onKeyDown={e => onKeyDown(removeMediaWarning, e)}>
			<button
				ref={selectMediaBtn}
				type="button"
				name="select-media"
				className="overlow-ellipsis"
				title={selectBtnTitle}
				aria-label={selectBtnTitle}
				onClick={selectMediaOnClick}
				onKeyDown={selectMediaOnKeyDown}>{title}</button>	
			<MediaOptionsDropdown buttons={() => createDropdown(removeMediaWarning)} />
			<button
				type="button"
				name="remove-media"
				title={removeBtnTitle}
				aria-label={removeBtnTitle}
				className="symbol"
				onClick={removeMediaWarning}>close</button>
		</div>
	)
}

BatchItem.propTypes = {
	index: number.isRequired,
	id: string.isRequired,
	focused: bool.isRequired,
	anchored: bool.isRequired,
	selected: bool.isRequired,
	title: string.isRequired,
	warnRemoveMedia: func.isRequired,
	createDropdown: func.isRequired,
	onKeyDown: func.isRequired,
	dispatch: func.isRequired
}

export default BatchItem
