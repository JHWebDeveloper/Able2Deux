import React, { useCallback, useMemo } from 'react'
import { arrayOf, bool, exact, func, number, oneOf, string } from 'prop-types'

import { toggleAspectRatioMarker, updateState } from 'actions'

import QualityIcon from '../../svg/QualityIcon.js'
import DropdownMenu from '../../form_elements/DropdownMenu'

const toggleTitle = state => state ? 'Hide' : 'Show'

// eslint-disable-next-line no-extra-parens
const AspectRatioMarkerButtons = ({ buttons, toggleColor, dispatch, navigateWithKeys }) => (
	buttons.map(({ id, label, selected }, i) => {
		const title = `${toggleTitle(selected)} ${label} Markers`
		
		return (
			<button
				key={id}
				type="button"
				className="ar-marker monospace"
				title={title}
				aria-label={title}
				style={toggleColor(selected)}
				autoFocus={i === 0}
				onClick={() => dispatch(toggleAspectRatioMarker(id))}
				onKeyDown={navigateWithKeys}>
				<span>{label}</span>
			</button>
		)
	})
)

const GridSelector = ({ previewQuality, grid, aspectRatioMarkers, gridColor, toggleGrid, dispatch }) => {
	const previewQualityBtnTitle = `Preview Quality: ${previewQuality * 100}%`
	const gridBtnTitle = `${toggleTitle(grid)} Grid`

	// eslint-disable-next-line no-extra-parens
	const enabledAspectRatioMarkers = useMemo(() => (
		aspectRatioMarkers.filter(({ disabled }) => !disabled)
	), [aspectRatioMarkers])

	const changePreviewQuality = useCallback(() => {
		let q = previewQuality + 0.25

		if (q > 1) q = 0.5

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
				title={previewQualityBtnTitle}
				aria-label={previewQualityBtnTitle}
				onClick={changePreviewQuality}>
				<QualityIcon quality={previewQuality}/>
			</button>
			<button
				type="button"
				className="symbol"
				title={gridBtnTitle}
				aria-label={gridBtnTitle}
				style={toggleColor(grid)}
				onClick={() => toggleGrid()}>grid_on</button>
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
	grid: bool.isRequired,
	previewQuality: oneOf([1, 0.75, 0.5]),
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
