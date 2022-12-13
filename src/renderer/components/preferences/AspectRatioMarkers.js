import React, { useEffect, useCallback } from 'react'

import {
  enableAspectRatioMarker,
  updateAspectRatioMarker,
  updateAspectRatioMarkerFromEvent,
  addNewAspectRatioMarker,
  removeSortableElement,
  moveSortableElement
} from 'actions'

import DraggableList from '../form_elements/DraggableList'
import Checkbox from '../form_elements/Checkbox'
import NumberInput from '../form_elements/NumberInput'
import DragIndicator from '../svg/DragIndicator'

const AspectRatioMarker = ({ marker, index, total, dispatch }) => {
  const { id, ratio } = marker

  const toggleVisibility = useCallback(() => {
    dispatch(enableAspectRatioMarker(id))
  }, [])

  const updateLabel = useCallback(e => {
    dispatch(updateAspectRatioMarkerFromEvent(id, e))
  }, [])

  const updateRatio = useCallback((index, { name, value }) => {
    ratio[index] = value

    dispatch(updateAspectRatioMarker(id, name, ratio))
  }, [])

  const add = useCallback(e => {
		dispatch(addNewAspectRatioMarker(index, e))
	}, [index])

  const remove = useCallback(() => {
		dispatch(removeSortableElement(id, 'aspectRatioMarkers'))
	}, [id])

	const moveUp = useCallback(() => {
		dispatch(moveSortableElement('aspectRatioMarkers', index, index - 1))
	}, [index])

	const moveDown = useCallback(() => {
		dispatch(moveSortableElement('aspectRatioMarkers', index, index + 2))
	}, [index])

  return (
    <>
      <Checkbox
        name="disabled"
        title="Show aspect ratio marker"
        checked={!marker.disabled}
        onChange={toggleVisibility} />
      <button
				type="button"
				name="add"
				className="app-button symbol"
				title="Add aspect ratio"
        onClick={add}>add</button>
			<button
				type="button"
				name="delete"
				className="app-button symbol"
				title="Add aspect ratio"
        onClick={remove}>remove</button>
      <input
        type="text"
        name="label"
        title="Label"
        className="panel-input"
        maxLength="6"
        value={marker.label}
        onChange={updateLabel} />
      <NumberInput
        name="ratio"
        title="Antecedent"
        value={ratio[0]}
        min={0.0001}
        max={9999}
        defaultValue={1}
        decimalPlaces={4}
        onChange={e => updateRatio(0, e)} />
      <span aria-hidden="true">:</span>
      <NumberInput
        name="ratio"
        title="Consequent"
        value={ratio[1]}
        min={0.0001}
        max={9999}
        defaultValue={1}
        decimalPlaces={4}
        onChange={e => updateRatio(1, e)} />
			{total > 1 ? <>
				{index > 0 ? (
					<button
						type="button"
						name="marker-up"
						className="app-button symbol"
						title="Move aspect ratio up"
            onClick={moveUp}>keyboard_arrow_up</button>
				) : <></>}
				{index < total - 1 ? (
					<button
						type="button"
						name="marker-down"
						className="app-button symbol"
						title="Move aspect ratio down"
            onClick={moveDown}>keyboard_arrow_down</button>
				) : <></>}
				<DragIndicator />
			</> : <></>}
    </>
  )
}

const AspectRatioMarkers = ({ aspectRatioMarkers, dispatch }) => {
  const sortingAction = useCallback((oldPos, newPos) => {
		dispatch(moveSortableElement('aspectRatioMarkers', oldPos, newPos))
	}, [])

  useEffect(() => {
		if (aspectRatioMarkers.length === 0) {
			dispatch(addNewAspectRatioMarker(0, false))
		}
	}, [aspectRatioMarkers])

  return (
    <fieldset className="aspect-ratio-markers">
      <legend>Aspect Ratio Markers:</legend>
      <div className="aspect-ratio-markers-grid">
        <DraggableList sortingAction={sortingAction}>
          {aspectRatioMarkers.map((marker, i) => (
            <AspectRatioMarker
              key={marker.id}
              marker={marker}
              index={i}
							total={aspectRatioMarkers.length}
              dispatch={dispatch} />
          ))}
        </DraggableList>
      </div>
    </fieldset>
  )
}

export default AspectRatioMarkers
