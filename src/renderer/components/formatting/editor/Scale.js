import React, { useCallback, useContext, useMemo } from 'react'
import { bool, exact, func, number, oneOf, oneOfType, shape, string } from 'prop-types'

import { PrefsContext } from 'store/preferences'

import {
	applySettingsToAll,
	copySettings,
	toggleMediaNestedCheckbox,
	updateMediaNestedState
} from 'actions'

import {
	calcRotatedBoundingBox,
	createSettingsMenu,
	degToRad
} from 'utilities'

import AccordionPanel from '../../form_elements/AccordionPanel'
import SliderSingle from '../../form_elements/SliderSingle'
import NumberInput from '../../form_elements/NumberInput'
import LinkIcon from '../../svg/LinkIcon'

const FitButton = ({ title, onClick }) => (
	<button
		type="button"
		className="app-button small symbol"
		title={title}
		aria-label={title}
		onClick={onClick}>unfold_more</button>
)

const propsXStatic = { name: 'x', title: 'Scale X', min: 0 }
const propsYStatic = { name: 'y', title: 'Scale Y', min: 0 }

const numberProps = {
	max: 4500,
	defaultValue: 100
}

const Scale = ({ id, scale, crop, rotation, width, height, editAll, dispatch }) => {
	const { renderOutput, scaleSliderMax } = useContext(PrefsContext).preferences

	const sensitivity = useMemo(() => scaleSliderMax / 100 * 2, [scaleSliderMax])
	const distortion = useMemo(() => scale.y / scale.x || 1, [scale.x, scale.y])
	const [ frameW, frameH ] = useMemo(() => renderOutput.split('x').map(n => parseInt(n)), [renderOutput])

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

	const triggers = [renderOutput, width, height, crop, rotation, id, scale.link, distortion, editAll]

	const fitToFrameWidth = useCallback(() => {
		const cropW = width * (crop.r - crop.l) / 100
		let fitToWPrc = frameW / cropW

		if (scale.link && rotation.freeRotateMode === 'with_bounds' && rotation.angle !== 0) {
			const cropH = height * (crop.b - crop.t) / 100 * distortion
			const rotW = calcRotatedBoundingBox(cropW, cropH, degToRad(rotation.angle), 'w')

			fitToWPrc *= cropW / rotW
		}

		fitToWPrc *= 100

		dispatch(updateMediaNestedState(id, 'scale', {
			x: fitToWPrc,
			y: scale.link ? fitToWPrc * distortion : scale.y
		}, editAll))
	}, [...triggers, scale.y])
	
	const fitToFrameHeight = useCallback(() => {
		const cropH = height * (crop.b - crop.t) / 100
		let fitToHPrc = frameH / cropH

		if (scale.link && rotation.freeRotateMode === 'with_bounds' && rotation.angle !== 0) {
			const cropW = width * (crop.r - crop.l) / 100 / distortion
			const rotH = calcRotatedBoundingBox(cropW, cropH, degToRad(rotation.angle), 'h')

			fitToHPrc *= cropH / rotH
		}

		fitToHPrc *= 100

		dispatch(updateMediaNestedState(id, 'scale', {
			x: scale.link ? fitToHPrc / distortion : scale.x,
			y: fitToHPrc
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

	const linkTitle = `${scale.link ? 'Unl' : 'L'}ink X and Y`

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
				title={linkTitle}
				aria-label={linkTitle}>
				<LinkIcon linked={scale.link} />
			</button>
		</>
	)
}

const ScalePanel = props => {
	const { isBatch, id, scale, dispatch } = props
	const { t, r, b, l } = props.crop
	const { freeRotateMode, angle } = props.rotation

	const settingsMenu = useMemo(() => isBatch ? createSettingsMenu([
		() => dispatch(copySettings({ scale })),
		() => dispatch(applySettingsToAll(id, { scale }))
	]) : [], [isBatch, id, scale])

	return (
		<AccordionPanel
			heading="Scale"
			id="scale"
			className="editor-options auto-rows"
			buttons={settingsMenu}>
			<Scale
				{...props}
				crop={{ t, r, b, l }}
				rotation={{ freeRotateMode, angle }} />
		</AccordionPanel>
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
	crop: shape({
		t: oneOfType([oneOf(['']), number]),
		r: oneOfType([oneOf(['']), number]),
		b: oneOfType([oneOf(['']), number]),
		l: oneOfType([oneOf(['']), number])
	}).isRequired,
	rotation: shape({
		freeRotateMode: oneOf(['inside_bounds', 'with_bounds']),
		angle: number
	}).isRequired,
	editAll: bool.isRequired,
	dispatch: func.isRequired
}

Scale.propTypes = propTypes
ScalePanel.propTypes = propTypes

export default ScalePanel
