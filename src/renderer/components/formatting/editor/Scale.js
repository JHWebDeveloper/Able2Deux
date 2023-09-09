import React, { memo, useCallback, useContext, useMemo } from 'react'
import { bool, func, number, oneOf, oneOfType, string } from 'prop-types'

import { PrefsContext } from 'store'

import {
	applyToAll,
	applyToSelection,
	copyAttributes,
	fitToFrameHeight,
	fitToFrameWidth,
	fitToFrameAuto,
	saveAsPreset,
	toggleMediaCheckbox,
	updateMediaStateBySelection
} from 'actions'

import {
	createSettingsMenu,
	extractScaleProps,
	objectsAreEqual
} from 'utilities'

import AccordionPanel from '../../form_elements/AccordionPanel'
import SliderSingle from '../../form_elements/SliderSingle'
import NumberInput from '../../form_elements/NumberInput'
import LinkIcon from '../../svg/LinkIcon'

const X_STATIC_PROPS = { name: 'scaleX', title: 'Scale X', min: 0 }
const Y_STATIC_PROPS = { name: 'scaleY', title: 'Scale Y', min: 0 }

const NUMBER_PROPS = Object.freeze({
	max: 4500,
	defaultValue: 100
})

const FitButton = ({ title, onClick, icon = 'height' }) => (
	<button
		type="button"
		className="app-button small symbol"
		title={title}
		aria-label={title}
		onClick={onClick}>{icon}</button>
)

const Scale = memo(({ id, scaleX, scaleY, scaleLink, multipleItemsSelected, dispatch }) => {
	const { renderOutput, scaleSliderMax } = useContext(PrefsContext).preferences

	const sensitivity = useMemo(() => scaleSliderMax / 100 * 2, [scaleSliderMax])
	const distortion = useMemo(() => scaleY / scaleX || 1, [scaleX, scaleY])
	const [ frameW, frameH ] = useMemo(() => renderOutput.split('x').map(n => parseInt(n)), [renderOutput])

	const linkTitle = `${scaleLink ? 'Unl' : 'L'}ink X and Y`

	const [ snapPointsX, snapPointsY ] = useMemo(() => {
		const pts = [[100], [100]]

		if (!scaleLink && scaleY !== 100) pts[0].push(scaleY)
		if (!scaleLink && scaleX !== 100) pts[1].push(scaleX)

		return pts
	}, [scaleLink, scaleX, scaleY])

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

	const updateAxis = useCallback(({ name, value }) => {
		dispatch(updateMediaStateBySelection({
			[name]: value
		}))
	}, [])

	const commonProps = useMemo(() => ({
		onChange: scaleLink ? updateScale : updateAxis
	}), [scaleLink, distortion])

	const propsX = {
		...commonProps,
		...X_STATIC_PROPS,
		value: scaleX
	}

	const propsY = {
		...commonProps,
		...Y_STATIC_PROPS,
		value: scaleY
	}

	const sliderProps = {
		max: scaleSliderMax,
		sensitivity
	}

	const dispatchFitToFrameWidth = useCallback(() => {
		dispatch(fitToFrameWidth(frameW))
	}, [frameW])

	const dispatchFitToFrameHeight = useCallback(() => {
		dispatch(fitToFrameHeight(frameH))
	}, [frameH])

	const dispatchFillToFrameAutoFill = useCallback(() => {
		dispatch(fitToFrameAuto('fill', frameW, frameH))
	}, [frameW, frameH])


	const dispatchFillToFrameAutoFit = useCallback(() => {
		dispatch(fitToFrameAuto('fit', frameW, frameH))
	}, [frameW, frameH])

	const toggleScaleLink = useCallback(e => {
		dispatch(toggleMediaCheckbox(id, e))
	}, [id])

	return (
		<>
			<label>X</label>
			<SliderSingle
				snapPoints={snapPointsX}
				{...propsX}
				{...sliderProps} />
			<FitButton
				title={`${scaleLink ? 'Fit' : 'Stretch'}${multipleItemsSelected ? ' Selected' : ''} to Frame Width`}
				onClick={dispatchFitToFrameWidth} />
			{multipleItemsSelected ? (
				<FitButton
					title="Fill Frame with Selected"
					icon="zoom_out_map"
					onClick={dispatchFillToFrameAutoFill} />
			) : <></>}
			<NumberInput
				{...propsX}
				{...NUMBER_PROPS} />
			<label>Y</label>
			<SliderSingle
				snapPoints={snapPointsY}
				{...propsY}
				{...sliderProps} />
			<FitButton
				title={`${scaleLink ? 'Fit' : 'Stretch'}${multipleItemsSelected ? ' Selected' : ''} to Frame Height`}
				onClick={dispatchFitToFrameHeight} />
			{multipleItemsSelected ? (
				<FitButton
					title="Fit Selected to Frame"
					icon="zoom_in_map"
					onClick={dispatchFillToFrameAutoFit} />
			) : <></>}
			<NumberInput
				{...propsY}
				{...NUMBER_PROPS} />
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
}, objectsAreEqual)

const ScalePanel = props => {
	const { id, multipleItems, multipleItemsSelected, dispatch } = props

	const settingsMenu = useMemo(() => (
		createSettingsMenu(multipleItems, multipleItemsSelected, [
			() => dispatch(copyAttributes(id, extractScaleProps)),
			() => dispatch(applyToSelection(id, extractScaleProps)),
			() => dispatch(applyToAll(id, extractScaleProps)),
			() => dispatch(saveAsPreset(id, extractScaleProps))
		])
	), [multipleItems, multipleItemsSelected, id])

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
	multipleItems: bool.isRequired,
	scaleX: oneOfType([oneOf(['']), number]).isRequired,
	scaleY: oneOfType([oneOf(['']), number]).isRequired,
	scaleLink: bool.isRequired,
	copyToClipboard: func.isRequired,
	dispatch: func.isRequired
}

Scale.propTypes = propTypes
ScalePanel.propTypes = propTypes

export default ScalePanel
