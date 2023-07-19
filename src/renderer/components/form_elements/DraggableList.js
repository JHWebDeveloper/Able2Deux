import React, { useCallback, useRef, useState } from 'react'
import { arrayOf, element, func } from 'prop-types'

const dragLeave = e => {
	e.currentTarget.classList.remove('insert')
}

const disableDrag = e => {
	if (e.target.dataset.noDrag) e.currentTarget.draggable = false
}

const enableDrag = e => {
	e.currentTarget.draggable = true
}

const DraggableList = ({ sortingAction, children }) => {
	const [ dragging, setDragging ] = useState(false)
	const draggable = children.length > 1
	const dragData = useRef({})

	const dragStart = useCallback((index, props) => {
		dragData.current = { index, props }
		setDragging(true)
	}, [])

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
					key={child.props.id}
					onDragStart={() => dragStart(i, child.props)}
					onDragOver={dragOver}
					onDragLeave={dragLeave}
					onDrop={e => drop(i, e)}
					draggable={draggable}
					onMouseDown={disableDrag}
					onMouseUp={enableDrag}>{child}</div>
			))}
			{draggable && (
				<span
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
