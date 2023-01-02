import React, { useCallback, useMemo } from 'react'
import { arrayOf, bool, exact, func, number, string } from 'prop-types'

import { updateState, toggleAspectRatioMarker } from 'actions'

import QualityIcon from '../../svg/QualityIcon.js'
import DropdownMenu from '../../form_elements/DropdownMenu'

const toggleTitle = state => state ? 'Hide' : 'Show'

// eslint-disable-next-line no-extra-parens
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

const GridSelector = ({ previewQuality, showGrid, aspectRatioMarkers, gridColor, toggleGrid, dispatch }) => {
	// eslint-disable-next-line no-extra-parens
	const enabledAspectRatioMarkers = useMemo(() => (
		aspectRatioMarkers.filter(({ disabled }) => !disabled)
	), [aspectRatioMarkers])

	const changePreviewQuality = useCallback(() => {
		let q = previewQuality / 2

		if (q < 1) q = 4

		dispatch(updateState({ previewQuality: q }))
	}, [previewQuality])

	const toggleColor = useCallback(gridSelected => ({
		color: gridSelected ? gridColor : 'currentColor'
	}), [gridColor])

	return (
		<div>
			<button
				type="button"
				className="symbol"
				title={`Preview Quality: ${100 / previewQuality}%`}
				onClick={changePreviewQuality}>
				<QualityIcon quality={previewQuality}/>
			</button>
			<button
				type="button"
				className="symbol"
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
