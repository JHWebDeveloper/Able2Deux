import React, { useCallback } from 'react'
import { bool, exact, func, string } from 'prop-types'

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
	selected: bool.isRequired,
	label: string.isRequired,
	name: string.isRequired,
	toggleColor: func.isRequired,
	onClick: func.isRequired
}

GridSelector.propTypes = {
	grids: exact({
		grid: bool,
		_239: bool,
		_185: bool,
		_166: bool,
		_43: bool,
		_11: bool,
		_916: bool
	}).isRequired,
	gridButtons: exact({
		_239: bool,
		_185: bool,
		_166: bool,
		_43: bool,
		_11: bool,
		_916: bool
	}),
	gridColor: string.isRequired,
	toggleGrids: func.isRequired
}

export default GridSelector
