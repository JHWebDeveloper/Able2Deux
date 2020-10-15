import React, { memo, useCallback, useContext, useMemo } from 'react'
import { bool, exact, func, number, object, oneOf, oneOfType, string } from 'prop-types'

import { PrefsContext } from 'store/preferences'

import {
	updateMediaNestedStateFromEvent,
	updateMediaNestedState,
	copySettings,
	applySettingsToAll,
	updateScale,
	fitToFrameWidth,
	fitToFrameHeight
} from 'actions'

import { compareProps, createSettingsMenu } from 'utilities'

import DetailsWrapper from '../../form_elements/DetailsWrapper'
import SliderPair from '../../form_elements/SliderPair'

const getCroppedDim = (d, c1, c2) => d * Math.max(0.01, (100 - c1 - c2) / 100)

const FitButton = ({ title, onClick }) => (
	<button
		type="button"
		className="app-button symbol"
		title={title}
		onClick={onClick}>unfold_more</button>
)

const Scale = memo(({ id, isBatch, scale, crop, width, height, editAll, dispatch }) => {
	const { renderOutput, scaleSliderMax } = useContext(PrefsContext).preferences

	const [ frameWidthPrc, frameHeightPrc ] = useMemo(() => {
		const [ w, h ] = renderOutput.split('x')

		return [
			w / getCroppedDim(width, crop.l, crop.r) * 100,
			h / getCroppedDim(height, crop.t, crop.b) * 100
		]
	}, [id, renderOutput, width, height, crop])

	const updateAxis = useCallback(e => {
		dispatch(updateMediaNestedStateFromEvent(id, 'scale', e, editAll))
	}, [id, editAll])

	const toggleScaleLink = useCallback(() => {
		dispatch(updateMediaNestedState(id, 'scale', {
			link: !scale.link
		}, editAll))
	}, [id, scale.link, editAll])

	const sliderProps = {
		min: 1,
		max: scaleSliderMax,
		defaultValue: 100,
		inputMax: 4500,
		points: [100],
		onChange: updateAxis
	}

	return (
		<DetailsWrapper
			summary="Scale"
			buttons={isBatch && createSettingsMenu([
				() => dispatch(copySettings({ scale })),
				() => dispatch(applySettingsToAll(id, { scale }))
			])}>
			<SliderPair
				link={scale.link}
				linkAction={toggleScaleLink}
				pairAction={e => dispatch(updateScale(id, editAll, scale, e))}
				sliders={[
					{
						...sliderProps,
						label: 'X',
						name: 'x',
						value: scale.x,
						Button: () => <FitButton
							title={`${scale.link ? 'Fit' : 'Stretch'} to Width`}
							onClick={() => {
								dispatch(fitToFrameWidth(id, editAll, scale, frameWidthPrc))
							}}/>
					},
					{
						...sliderProps,
						label: 'Y',
						name: 'y',
						value: scale.y,
						Button: () => <FitButton
							title={`${scale.link ? 'Fit' : 'Stretch'} to Height`}
							onClick={() => {
								dispatch(fitToFrameHeight(id, editAll, scale, frameHeightPrc))
							}}/>
					}
				]}/>
		</DetailsWrapper>
	)
}, compareProps)

Scale.propTypes = {
	id: string.isRequired,
	isBatch: bool.isRequired,
	width: number.isRequired,
	height: number.isRequired,
	scale: exact({
		x: oneOfType([oneOf(['']), number]),
		y: oneOfType([oneOf(['']), number]),
		link: bool
	}).isRequired,
	crop: object.isRequired,
	editAll: bool.isRequired,
	dispatch: func.isRequired
}

FitButton.propTypes = {
	title: string.isRequired,
	onClick: func.isRequired
}

export default Scale
