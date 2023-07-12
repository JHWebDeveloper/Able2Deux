import React, { useCallback, useContext, useMemo } from 'react'
import { bool, func, number, oneOf, oneOfType, string } from 'prop-types'

import { PrefsContext } from 'store'

import {
	applySettingsToAll,
	copySettings,
	toggleMediaCheckbox,
	updateMediaStateBySelection
} from 'actions'

import {
	calcRotatedBoundingBox,
	createSettingsMenu,
	degToRad,
	pipe
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

const propsXStatic = { name: 'scaleX', title: 'Scale X', min: 0 }
const propsYStatic = { name: 'scaleY', title: 'Scale Y', min: 0 }

const numberProps = {
	max: 4500,
	defaultValue: 100
}

const Scale = ({ id, scaleX, scaleY, scaleLink, cropT, cropR, cropB, cropL, freeRotateMode, angle, width, height, dispatch }) => {
	const { renderOutput, scaleSliderMax } = useContext(PrefsContext).preferences

	const sensitivity = useMemo(() => scaleSliderMax / 100 * 2, [scaleSliderMax])
	const distortion = useMemo(() => scaleY / scaleX || 1, [scaleX, scaleY])
	const [ frameW, frameH ] = useMemo(() => renderOutput.split('x').map(n => parseInt(n)), [renderOutput])

	const updateAxis = useCallback(({ name, value }) => {
		dispatch(updateMediaStateBySelection({
			[name]: value
		}))
	}, [])

	const updateScale = useCallback(({ name, value }) => {
		const axis = {}
			
		if (value === '') {
			axis.scaleX = value
			axis.scaleY = value
		} else {
			const isX = name === 'scaleX'
			axis.scaleX = isX ? value : value / distortion
			axis.scaleY = isX ? value * distortion : value
		}

		dispatch(updateMediaStateBySelection(axis))
	}, [distortion])

	const triggers = [renderOutput, width, height, cropT, cropR, cropB, cropL, freeRotateMode, angle, scaleLink, distortion]

	const fitToFrameWidth = useCallback(() => {
		const cropW = width * (cropR - cropL) / 100
		let fitToWPrc = frameW / cropW

		if (scaleLink && freeRotateMode === 'with_bounds' && angle !== 0) {
			const cropH = height * (cropB - cropT) / 100 * distortion
			const rotW = calcRotatedBoundingBox(cropW, cropH, degToRad(angle), 'w')

			fitToWPrc *= cropW / rotW
		}

		fitToWPrc *= 100

		dispatch(updateMediaStateBySelection({
			scaleX: fitToWPrc,
			scaleY: scaleLink ? fitToWPrc * distortion : scaleY
		}))
	}, [...triggers, scaleY])
	
	const fitToFrameHeight = useCallback(() => {
		const cropH = height * (cropB - cropT) / 100
		let fitToHPrc = frameH / cropH

		if (scaleLink && freeRotateMode === 'with_bounds' && angle !== 0) {
			const cropW = width * (cropR - cropL) / 100 / distortion
			const rotH = calcRotatedBoundingBox(cropW, cropH, degToRad(angle), 'h')

			fitToHPrc *= cropH / rotH
		}

		fitToHPrc *= 100

		dispatch(updateMediaStateBySelection({
			scaleX: scaleLink ? fitToHPrc / distortion : scaleX,
			scaleY: fitToHPrc
		}))
	}, [...triggers, scaleX])

	const toggleScaleLink = useCallback(e => {
		dispatch(toggleMediaCheckbox(id, e))
	}, [id])

	const common = useMemo(() => ({
		onChange: scaleLink ? updateScale : updateAxis
	}), [scaleLink, distortion])

	const [ snapPointsX, snapPointsY ] = useMemo(() => {
		const pts = [[100], [100]]

		if (!scaleLink && scaleY !== 100) pts[0].push(scaleY)
		if (!scaleLink && scaleX !== 100) pts[1].push(scaleX)

		return pts
	}, [scaleLink, scaleX, scaleY])

	const propsX = {
		...common,
		...propsXStatic,
		value: scaleX
	}

	const propsY = {
		...common,
		...propsYStatic,
		value: scaleY
	}

	const sliderProps = {
		max: scaleSliderMax,
		sensitivity
	}

	const linkTitle = `${scaleLink ? 'Unl' : 'L'}ink X and Y`

	return (
		<>
			<label>X</label>
			<SliderSingle
				snapPoints={snapPointsX}
				{...propsX}
				{...sliderProps} />
			<FitButton
				title={`${scaleLink ? 'Fit' : 'Stretch'} to Width`}
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
				title={`${scaleLink ? 'Fit' : 'Stretch'} to Height`}
				onClick={fitToFrameHeight} />
			<NumberInput
				{...propsY}
				{...numberProps} />
			<button
				type="button"
				name="scaleLink"
				className="link-button"
				onClick={toggleScaleLink}
				title={linkTitle}
				aria-label={linkTitle}>
				<LinkIcon linked={scaleLink} />
			</button>
		</>
	)
}

const ScalePanel = props => {
	const { isBatch, id, scaleX, scaleY, scaleLink, dispatch } = props
	const scaleProps = { scaleX, scaleY, scaleLink }

	const settingsMenu = useMemo(() => createSettingsMenu(isBatch, [
		() => pipe(copySettings, dispatch)(scaleProps),
		() => pipe(applySettingsToAll(id), dispatch)(scaleProps)
	]), [isBatch, id, scaleProps])

	return (
		<AccordionPanel
			heading="Scale"
			id="scale"
			className="editor-options auto-rows"
			buttons={settingsMenu}>
			<Scale {...props} />
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
	scaleX: oneOfType([oneOf(['']), number]),
	scaleY: oneOfType([oneOf(['']), number]),
	scaleLink: bool,
	cropT: oneOfType([oneOf(['']), number]),
	cropR: oneOfType([oneOf(['']), number]),
	cropB: oneOfType([oneOf(['']), number]),
	cropL: oneOfType([oneOf(['']), number]),
	freeRotateMode: oneOf(['inside_bounds', 'with_bounds']),
	angle: number,
	dispatch: func.isRequired
}

Scale.propTypes = propTypes
ScalePanel.propTypes = propTypes

export default ScalePanel
