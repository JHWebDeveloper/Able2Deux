import React, { useCallback } from 'react'
import { arrayOf, bool, exact, func, number, string } from 'prop-types'

import { toggleAspectRatioMarker } from 'actions'

const toggleTitle = state => state ? 'Hide' : 'Show'

const GridButton = ({ title, style, onClick, label }) => (
	<button
		type="button"
		className="ar-marker monospace"
		title={title}
		style={style}
		onClick={onClick}>
		<span>{label}</span>
	</button>
)

const GridSelector = ({ showGrid, aspectRatioMarkers, gridColor, toggleGrid, dispatch }) => {
	const toggleColor = useCallback(gridSelected => ({
		color: gridSelected ? gridColor : '#eee'
	}), [gridColor])

	return (
		<div>
			<button
				type="button"
				className="symbol"
				name="grid"
				title={`${toggleTitle(showGrid)} Grid`}
				style={toggleColor(showGrid)}
				onClick={() => toggleGrid(!showGrid)}>grid_on</button>
			{aspectRatioMarkers.map(({ disabled, id, label, selected }) => disabled ? <></> : (
				<GridButton
					key={id}
					label={label}
					title={`${toggleTitle(selected)} ${label} Markers`}
					style={toggleColor(selected)}
					onClick={() => dispatch(toggleAspectRatioMarker(id))} />
			))}
		</div>
	)
}

GridButton.propTypes = {
	title: string.isRequired,
	label: string.isRequired,
	style: exact({
		color: string
	}).isRequired,
	onClick: func.isRequired
}

GridSelector.propTypes = {
	showGrid: bool.isRequired,
	aspectRatioMarkers: arrayOf(exact({
		id: string,
		label: string,
		disabled: bool,
		selected: bool,
		ratio: arrayOf(number)
	})).isRequired,
	gridColor: string.isRequired,
	toggleGrid: func.isRequired,
	dispatch: func.isRequired
}

export default GridSelector
