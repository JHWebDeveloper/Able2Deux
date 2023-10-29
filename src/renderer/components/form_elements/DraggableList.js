import React, { useCallback, useContext, useId } from 'react'
import { arrayOf, bool, element, func, string } from 'prop-types'

import { DraggingContext, DraggingProvider } from 'store'

const dragLeave = e => {
	e.currentTarget.classList.remove('insert')
}

const disableDrag = e => {
	if (e.target.matches('[data-no-drag="true"], [data-no-drag] *')) e.preventDefault()
}

const DraggableList = ({
	hasSharedContext,
	allowCrossTableDrops,
	startMessage = 'Drag and Drop New Item',
	sortingAction,
	addAction,
	children
}) => {
	const { dragOrigin, setDragOrigin } = useContext(DraggingContext)
	const listLength = children.length
	const canAddElementOnDrop = hasSharedContext && allowCrossTableDrops
	const draggable = hasSharedContext && !allowCrossTableDrops || listLength > 1
	const listId = useId()

	const dragStart = useCallback((e, index, props) => {
		if (!draggable) e.preventDefault()
		setDragOrigin(listId)
		e.dataTransfer.setData('dragData', JSON.stringify({ index, props }))
	}, [draggable])

	const dragOver = useCallback(e => {
		e.preventDefault()
		if (canAddElementOnDrop || dragOrigin === listId) e.currentTarget.classList.add('insert')
	}, [dragOrigin])

	const drop = useCallback((i, e) => {
		e.preventDefault()

		const dragData = JSON.parse(e.dataTransfer.getData('dragData'))
		const dragDataFromSameList = dragOrigin === listId

		if (canAddElementOnDrop && !dragDataFromSameList) {
			addAction(i, dragData.props, e)
		} else if (dragDataFromSameList) {
			sortingAction(dragData.index, i, dragData.props, e)
		}

		dragLeave(e)
		setDragOrigin('')
	}, [dragOrigin])

	return (
		<div className="sortable-list">
			{children.map((child, i) => (
				<div
					key={`${listId}_${i}`}
					onDragStart={e => dragStart(e, i, child.props)}
					onDragOver={dragOver}
					onDragLeave={dragLeave}
					onDrop={e => drop(i, e)}
					onMouseDown={disableDrag}
					draggable>{child}</div>
			))}
			{canAddElementOnDrop || draggable ? (
				<div
					key={`${listId}_${listLength}`}
					className="insert-last"
					onDragOver={dragOver}
					onDragLeave={dragLeave}
					onDrop={e => drop(listLength, e)}>
					{canAddElementOnDrop && !listLength ? <p>{startMessage}</p> : <></>}
				</div>
			) : <></>}
		</div>
	)
}

// eslint-disable-next-line no-extra-parens
const DraggableListContext = props => props.hasSharedContext ? (
	<DraggableList {...props} />
) : (	
	<DraggingProvider>
		<DraggableList {...props} />
	</DraggingProvider>
)

DraggableList.propTypes = {
	hasSharedContext: bool,
	allowCrossTableDrops: bool,
	startMessage: string,
	sortingAction: func.isRequired,
	addAction: func,
	children: arrayOf(element).isRequired
}

DraggableListContext.propTypes = {
	hasSharedContext: bool
}

export default DraggableListContext
