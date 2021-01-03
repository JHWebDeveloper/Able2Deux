import React, { useCallback } from 'react'
import { bool, exact, func, string } from 'prop-types'

const toggleTitle = state => state ? 'Hide' : 'Show'

const GridButton = ({ selected, label, name, toggleColor, onClick }) => (
	<button
		type="button"
		className="monospace"
		title={`${toggleTitle(selected)} ${label} Markers`}
		name={name}
		style={toggleColor(selected)}
		onClick={onClick}>
		<span>{label}</span>
	</button>
)

const GridSelector = ({ grids, gridButtons, gridColor, toggleGrids }) => {
	const toggleColor = useCallback(gridName => ({
		color: gridName ? gridColor : '#eee'
	}), [gridColor])

	const toggleGrid = useCallback(e => {
		toggleGrids({
			...grids,
			[e.target.name]: !grids[e.target.name]
		})
	}, [grids])

	return (
		<div>
			<button
				type="button"
				className="symbol"
				name="grid"
				title={`${toggleTitle(grids.grid)} Grid`}
				style={toggleColor(grids.grid)}
				onClick={toggleGrid}>grid_on</button>
			{gridButtons._239 && <GridButton
				label="2.39"
				name="_239"
				selected={grids._239}
				toggleColor={toggleColor}
				onClick={toggleGrid} />}
			{gridButtons._185 && <GridButton
				label="1.85"
				name="_185"
				selected={grids._185}
				toggleColor={toggleColor}
				onClick={toggleGrid} />}
			{gridButtons._166 && <GridButton
				label="1.66"
				name="_166"
				selected={grids._166}
				toggleColor={toggleColor}
				onClick={toggleGrid} />}
			{gridButtons._43 && <GridButton
				label="4:3"
				name="_43"
				selected={grids._43}
				toggleColor={toggleColor}
				onClick={toggleGrid} />}
			{gridButtons._11 && <GridButton
				label="1:1"
				name="_11"
				selected={grids._11}
				toggleColor={toggleColor}
				onClick={toggleGrid} />}
			{gridButtons._916 && <GridButton
				label="9:16"
				name="_916"
				selected={grids._916}
				toggleColor={toggleColor}
				onClick={toggleGrid} />}
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
