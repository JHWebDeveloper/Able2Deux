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
	updateMediaStateBySelection
} from 'actions'

import {
	createObjectPicker,
	createSettingsMenu,
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

const extractScaleProps = createObjectPicker(['scaleX', 'scaleY', 'scaleLink'])

const FitButton = ({ title, onClick, icon = 'open_in_full', rotateIcon = 0 }) => (
	<button
		type="button"
		className="app-button small symbol"
		title={title}
		aria-label={title}
		onClick={onClick}>
		<span style={{ rotate: `${rotateIcon}deg` }}>{icon}</span>
	</button>
)

const Scale = memo(({ scaleX, scaleY, scaleLink, multipleItemsSelected, updateSelectionFromEvent, toggleSelectionCheckbox, dispatch }) => {
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

	const commonProps = useMemo(() => ({
		onChange: scaleLink ? updateScale : updateSelectionFromEvent
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

	const dispatchFitToFrameAutoFill = useCallback(() => {
		dispatch(fitToFrameAuto('fill', frameW, frameH))
	}, [frameW, frameH])


	const dispatchFitToFrameAutoFit = useCallback(() => {
		dispatch(fitToFrameAuto('fit', frameW, frameH))
	}, [frameW, frameH])

	return (
		<>
			<label>X</label>
			<SliderSingle
				snapPoints={snapPointsX}
				{...propsX}
				{...sliderProps} />
			<FitButton
				rotateIcon={45}
				title={`${scaleLink ? 'Fit' : 'Stretch'}${multipleItemsSelected ? ' Selected' : ''} to Frame Width`}
				onClick={dispatchFitToFrameWidth} />
			{multipleItemsSelected ? (
				<FitButton
					title="Fill Frame with Selected"
					icon="open_in_full"
					onClick={dispatchFitToFrameAutoFill} />
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
				rotateIcon={-45}
				title={`${scaleLink ? 'Fit' : 'Stretch'}${multipleItemsSelected ? ' Selected' : ''} to Frame Height`}
				onClick={dispatchFitToFrameHeight} />
			{multipleItemsSelected ? (
				<FitButton
					title="Fit Selected in Frame"
					icon="close_fullscreen"
					onClick={dispatchFitToFrameAutoFit} />
			) : <></>}
			<NumberInput
				{...propsY}
				{...NUMBER_PROPS} />
			<button
				type="button"
				name="scaleLink"
				className="link-button"
				onClick={toggleSelectionCheckbox}
				title={linkTitle}
				aria-label={linkTitle}>
				<LinkIcon linked={scaleLink} />
			</button>
		</>
	)
}, objectsAreEqual)

const ScalePanel = ({ id, multipleItems, ...rest }) => {
	const { multipleItemsSelected, dispatch } = rest

	// eslint-disable-next-line no-extra-parens
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
			options={settingsMenu}>
			<Scale {...rest} />
		</AccordionPanel>
	)
}

FitButton.propTypes = {
	title: string.isRequired,
	icon: string,
	rotateIcon: number,
	onClick: func.isRequired
}

const propTypes = {
	id: string.isRequired,
	multipleItems: bool.isRequired,
	multipleItemsSelected: bool.isRequired,
	scaleX: oneOfType([oneOf(['']), number]).isRequired,
	scaleY: oneOfType([oneOf(['']), number]).isRequired,
	scaleLink: bool.isRequired,
	updateSelectionFromEvent: func.isRequired,
	toggleSelectionCheckbox: func.isRequired,
	dispatch: func.isRequired
}

Scale.propTypes = propTypes
ScalePanel.propTypes = propTypes

export default ScalePanel
