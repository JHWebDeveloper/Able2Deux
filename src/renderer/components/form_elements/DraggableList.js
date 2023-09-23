import React, { useCallback, useId, useRef, useState } from 'react'
import { arrayOf, element, func } from 'prop-types'

const dragLeave = e => {
	e.currentTarget.classList.remove('insert')
}

const disableDrag = e => {
	if (e.target.matches('[data-no-drag="true"], [data-no-drag] *')) e.preventDefault()
}

const DraggableList = ({ sortingAction, children }) => {
	const [ dragging, setDragging ] = useState(false)
	const draggable = children.length > 1
	const dragData = useRef({})
	const setKey = useId()

	const dragStart = useCallback((e, index, props) => {
		if (!draggable) return e.preventDefault()
		dragData.current = { index, props }
		setDragging(true)
	}, [draggable])

	const dragOver = useCallback(e => {
		e.preventDefault()
		if (dragging) e.currentTarget.classList.add('insert')
	}, [dragging])

	const drop = useCallback((i, e) => {
		e.preventDefault()
		sortingAction(dragData.current.index, i, dragData.current.props, e)
		dragLeave(e)
		setDragging(false)
	}, [sortingAction])

	return (
		<>
			{children.map((child, i) => (
				<div
					key={`${setKey}_${i}`}
					onDragStart={e => dragStart(e, i, child.props)}
					onDragOver={dragOver}
					onDragLeave={dragLeave}
					onDrop={e => drop(i, e)}
					onMouseDown={disableDrag}
					draggable>{child}</div>
			))}
			{draggable && (
				<span
					key={`${setKey}_${children.length}`}
					className="insert-last"
					onDragOver={dragOver}
					onDragLeave={dragLeave}
					onDrop={e => drop(children.length, e)} />
			)}
		</>
	)
}

DraggableList.propTypes = {
	sortingAction: func.isRequired,
	children: arrayOf(element).isRequired
}

export default DraggableList
