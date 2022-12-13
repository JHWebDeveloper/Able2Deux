import React, { useCallback, useMemo } from 'react'
import { arrayOf, bool, exact, func, number, string } from 'prop-types'

import { toggleAspectRatioMarker } from 'actions'

import DropdownMenu from '../../form_elements/DropdownMenu'

const toggleTitle = state => state ? 'Hide' : 'Show'

const AspectRatioMarkerButtons = ({ buttons, toggleColor, dispatch }) => (
	buttons.map(({ id, label, selected }) => (
		<button
			key={id}
			type="button"
			className="ar-marker monospace"
			title={`${toggleTitle(selected)} ${label} Markers`}
			style={toggleColor(selected)}
			onClick={() => dispatch(toggleAspectRatioMarker(id))}>
			<span>{label}</span>
		</button>
	))
)

const GridSelector = ({ showGrid, aspectRatioMarkers, gridColor, toggleGrid, dispatch }) => {
	const enabledAspectRatioMarkers = useMemo(() => (
		aspectRatioMarkers.filter(({ disabled }) => !disabled)
	), [aspectRatioMarkers])

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
			{enabledAspectRatioMarkers.length > 3 ? (
				<>
					<AspectRatioMarkerButtons
						buttons={enabledAspectRatioMarkers.slice(0, 2)}
						toggleColor={toggleColor}
						dispatch={dispatch} />
					<DropdownMenu
						className="ar-markers"
						icon="arrow_drop_down">
						<AspectRatioMarkerButtons
							buttons={enabledAspectRatioMarkers.slice(2)}
							toggleColor={toggleColor}
							dispatch={dispatch} />
					</DropdownMenu>
				</>
			) : (
				<AspectRatioMarkerButtons
					buttons={enabledAspectRatioMarkers}
					toggleColor={toggleColor}
					dispatch={dispatch} />
			)}
		</div>
	)
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
