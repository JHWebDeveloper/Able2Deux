import React, { useCallback, useState } from 'react'
import { arrayOf, element, func } from 'prop-types'

const dragLeave = e => {
	e.currentTarget.classList.remove('insert')
}

const DraggableList = ({ sortingAction, children }) => {
	const [ dragging, setDragging ] = useState(false)
	const draggable = children.length > 1

	const dragStart = useCallback((i, e) => {
		e.dataTransfer.setData('insert', i)
		setDragging(true)
	}, [])

	const dragOver = useCallback(e => {
		e.preventDefault()
		if (dragging) e.currentTarget.classList.add('insert')
	}, [dragging])

	const drop = useCallback((i, e) => {
		e.preventDefault()
		sortingAction(e.dataTransfer.getData('insert'), i)
		dragLeave(e)
		setDragging(false)
	}, [])

	return (
		<>
			{children.map((child, i) => (
				<div
					key={child.key}
					className="draggable"
					onDragStart={e => dragStart(i, e)}
					onDragOver={dragOver}
					onDragLeave={dragLeave}
					onDrop={e => drop(i, e)}
					draggable={draggable}>{child}</div>
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
