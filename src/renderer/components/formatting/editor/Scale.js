import React, { memo, useCallback, useContext, useMemo } from 'react'
import { bool, exact, func, number, object, oneOf, oneOfType, string } from 'prop-types'

import { PrefsContext } from 'store/preferences'

import {
	updateMediaNestedState,
	toggleMediaNestedCheckbox,
	copySettings,
	applySettingsToAll
} from 'actions'

import { compareProps, createSettingsMenu } from 'utilities'

import DetailsWrapper from '../../form_elements/DetailsWrapper'
import SliderSingle from '../../form_elements/SliderSingle'
import NumberInput from '../../form_elements/NumberInput'
import LinkIcon from '../../svg/LinkIcon'

const getCroppedDim = (dim, crop1, crop2) => dim * (crop2 - crop1) / 100

const FitButton = ({ title, onClick }) => (
	<button
		type="button"
		className="app-button symbol"
		title={title}
		onClick={onClick}>unfold_more</button>
)

const propsXStatic = { name: 'x', title: 'Scale X', min: 0 }
const propsYStatic = { name: 'y', title: 'Scale Y', min: 0 }

const numberProps = {
	max: 4500,
	defaultValue: 100
}

const Scale = memo(({ id, isBatch, scale, crop, width, height, editAll, dispatch }) => {
	const { renderOutput, scaleSliderMax } = useContext(PrefsContext).preferences

	const sensitivity = useMemo(() => scaleSliderMax / 100 * 2, [scaleSliderMax])
	const offset = useMemo(() => scale.y / scale.x || 1, [scale.x, scale.y])

	const { t, b, r, l } = crop

	const [ frameWidthPrc, frameHeightPrc ] = useMemo(() => {
		const [ w, h ] = renderOutput.split('x')

		return [
			w / getCroppedDim(width, l, r) * 100,
			h / getCroppedDim(height, t, b) * 100
		]
	}, [renderOutput, width, height, t, b, r, l])

	const updateAxis = useCallback(({ name, value }) => {
		dispatch(updateMediaNestedState(id, 'scale', {
			[name]: value
		}, editAll))
	}, [id, editAll])

	const updateScale = useCallback(({ name, value }) => {
		const axis = {}
			
		if (value === '') {
			axis.x = value
			axis.y = value
		} else {
			const isX = name === 'x'
			axis.x = isX ? value : value / offset
			axis.y = isX ? value * offset : value
		}

		dispatch(updateMediaNestedState(id, 'scale', axis, editAll))
	}, [offset, id, editAll])

	const fitToFrameWidth = useCallback(() => {
		dispatch(updateMediaNestedState(id, 'scale', {
			x: frameWidthPrc,
			y: scale.link ? frameWidthPrc : scale.y
		}, editAll))
	}, [id, frameWidthPrc, scale.link, scale.y, editAll, t, b, r, l])
	
	const fitToFrameHeight = useCallback(() => {
		dispatch(updateMediaNestedState(id, 'scale', {
			x: scale.link ? frameHeightPrc : scale.x,
			y: frameHeightPrc
		}, editAll))
	}, [id, scale.link, frameWidthPrc, scale.x, editAll, t, b, r, l])

	const toggleScaleLink = useCallback(e => {
		dispatch(toggleMediaNestedCheckbox(id, 'scale', e, editAll))
	}, [id, editAll])

	const common = useMemo(() => ({
		onChange: scale.link ? updateScale : updateAxis
	}), [scale.link, offset, id, editAll])

	const propsX = {
		...common,
		...propsXStatic,
		value: scale.x
	}

	const propsY = {
		...common,
		...propsYStatic,
		value: scale.y
	}

	const sliderProps = {
		max: scaleSliderMax,
		snapPoints: [100],
		sensitivity
	}

	return (
		<DetailsWrapper
			summary="Scale"
			className="single-slider-grid"
			buttons={isBatch && createSettingsMenu([
				() => dispatch(copySettings({ scale })),
				() => dispatch(applySettingsToAll(id, { scale }))
			])}>
			<label>X</label>
			<SliderSingle
				{...propsX}
				{...sliderProps} />
			<FitButton
				title={`${scale.link ? 'Fit' : 'Stretch'} to Width`}
				onClick={fitToFrameWidth} />
			<NumberInput
				{...propsX}
				{...numberProps} />
			<label>Y</label>
			<SliderSingle
				{...propsY}
				{...sliderProps} />
			<FitButton
				title={`${scale.link ? 'Fit' : 'Stretch'} to Height`}
				onClick={fitToFrameHeight} />
			<NumberInput
				{...propsY}
				{...numberProps} />
			<button
				type="button"
				name="link"
				onClick={toggleScaleLink}
				title={`${scale.link ? 'Unl' : 'L'}ink X and Y`}>
				<LinkIcon linked={scale.link} />
			</button>
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
