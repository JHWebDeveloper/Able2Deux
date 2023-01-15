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

const FitButton = ({ title, onClick }) => (
	<button
		type="button"
		className="app-button small symbol"
		title={title}
		onClick={onClick}>unfold_more</button>
)

const propsXStatic = { name: 'x', title: 'Scale X', min: 0 }
const propsYStatic = { name: 'y', title: 'Scale Y', min: 0 }

const numberProps = {
	max: 4500,
	defaultValue: 100
}

const calculateFitPercent = (renderOutput, width, height, t, b, l, r) => {
	const [ frameW, frameH ] = renderOutput.split('x')
	const cropW = width * (r - l) / 100
	const cropH = height * (b - t) / 100

	return [
		frameW / cropW * 100,
		frameH / cropH * 100
	]
}

const Scale = memo(({ id, scale, crop, width, height, editAll, dispatch }) => {
	const { renderOutput, scaleSliderMax } = useContext(PrefsContext).preferences

	const sensitivity = useMemo(() => scaleSliderMax / 100 * 2, [scaleSliderMax])
	const distortion = useMemo(() => scale.y / scale.x || 1, [scale.x, scale.y])

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
			axis.x = isX ? value : value / distortion
			axis.y = isX ? value * distortion : value
		}

		dispatch(updateMediaNestedState(id, 'scale', axis, editAll))
	}, [distortion, id, editAll])

	const { t, b, r, l } = crop
	const triggers = [renderOutput, width, height, t, b, r, l, id, scale.link, distortion, editAll]

	const fitToFrameWidth = useCallback(() => {
		const frameWidthPrc = calculateFitPercent(renderOutput, width, height, t, b, l, r)[0]

		dispatch(updateMediaNestedState(id, 'scale', {
			x: frameWidthPrc,
			y: scale.link ? frameWidthPrc * distortion : scale.y
		}, editAll))
	}, [...triggers, scale.y])
	
	const fitToFrameHeight = useCallback(() => {
		const frameHeightPrc = calculateFitPercent(renderOutput, width, height, t, b, l, r)[1]
		
		dispatch(updateMediaNestedState(id, 'scale', {
			x: scale.link ? frameHeightPrc / distortion : scale.x,
			y: frameHeightPrc
		}, editAll))
	}, [...triggers, scale.x])

	const toggleScaleLink = useCallback(e => {
		dispatch(toggleMediaNestedCheckbox(id, 'scale', e, editAll))
	}, [id, editAll])

	const common = useMemo(() => ({
		onChange: scale.link ? updateScale : updateAxis
	}), [scale.link, distortion, id, editAll])

	const [ snapPointsX, snapPointsY ] = useMemo(() => {
		const pts = [[100], [100]]

		if (!scale.link && scale.y !== 100) pts[0].push(scale.y)
		if (!scale.link && scale.x !== 100) pts[1].push(scale.x)

		return pts
	}, [scale])

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
		sensitivity
	}

	return (
		<>
			<label>X</label>
			<SliderSingle
				snapPoints={snapPointsX}
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
				snapPoints={snapPointsY}
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
		</>
	)
}, compareProps)

const ScalePanel = props => {
	const { isBatch, id, scale, dispatch } = props

	const settingsMenu = useMemo(() => isBatch ? createSettingsMenu([
		() => dispatch(copySettings({ scale })),
		() => dispatch(applySettingsToAll(id, { scale }))
	]) : [], [isBatch, id, scale])

	return (
		<DetailsWrapper
			summary="Scale"
			className="editor-panel auto-rows scale-panel"
			buttons={settingsMenu}>
			<Scale {...props} />
		</DetailsWrapper>
	)
}

FitButton.propTypes = {
	title: string.isRequired,
	onClick: func.isRequired
}

const propTypes = {
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

Scale.propTypes = propTypes
ScalePanel.propTypes = propTypes

export default ScalePanel
