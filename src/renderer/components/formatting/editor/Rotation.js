import React, { memo, useCallback, useMemo } from 'react'
import { bool, func, oneOf, number, string } from 'prop-types'

import {
	applyToAll,
	applyToSelection,
	copyAttributes,
	reflectMedia,
	rotateMedia,
	saveAsPreset
} from 'actions'

import {
	createObjectPicker,
	createSettingsMenu,
	detectMediaIsSideways,
	extractRelevantMediaProps,
	objectsAreEqual
} from 'utilities'

import AccordionPanel from '../../form_elements/AccordionPanel'
import RadioSet from '../../form_elements/RadioSet'
import FreeRotate from './FreeRotate'

const TRANSPOSE_BUTTONS = Object.freeze([
	{
		label: '0°',
		value: ''
	},
	{
		label: '90°cw',
		value: 'transpose=1'
	},
	{
		label: '90°ccw',
		value: 'transpose=2'
	},
	{
		label: '180°',
		value: 'transpose=2,transpose=2'
	}
])

const FREE_ROTATE_MODE_BUTTONS = Object.freeze([
	{
		label: 'Inside Bounds',
		value: 'inside_bounds'
	},
	{
		label: 'With Bounds',
		value: 'with_bounds'
	}
])

const createReflectButtons = isSideways => [
	{
		label: 'None',
		value: ''
	},
	{
		label: 'Horizontally',
		value: isSideways ? 'vflip' : 'hflip'
	},
	{
		label: 'Vertically',
		value: isSideways ? 'hflip' : 'vflip'
	},
	{
		label: 'Both',
		value: 'hflip,vflip'
	}
]

const extractRotationProps = createObjectPicker(['transpose', 'reflect', 'freeRotateMode', 'angle', 'rotatedCentering'])

const Rotation = memo(props => {
	const { transpose, reflect, freeRotateMode, updateSelectionFromEvent, dispatch } = props
	const reflectButtons = useMemo(() => createReflectButtons(detectMediaIsSideways(transpose)), [transpose])

	const updateReflectMedia = useCallback(e => {
		dispatch(reflectMedia(e))
	}, [])

	const updateRotateMedia = useCallback(e => {
		dispatch(rotateMedia(e))
	}, [])

	return (
		<>
			<fieldset className="radio-set">
				<legend>Reflect<span aria-hidden>:</span></legend>
				<RadioSet
					name="reflect"
					state={reflect}
					onChange={updateReflectMedia}
					buttons={reflectButtons} />
			</fieldset>
			<fieldset className="radio-set">
				<legend>Rotate<span aria-hidden>:</span></legend>
				<RadioSet 
					name="transpose"
					state={transpose}
					onChange={updateRotateMedia}
					buttons={TRANSPOSE_BUTTONS}/>
			</fieldset>
			{props.showFreeRotate ? <>
				<fieldset className="radio-set">
					<legend>Free Rotate Mode<span aria-hidden>:</span></legend>
					<RadioSet
						name="freeRotateMode"
						state={freeRotateMode}
						onChange={updateSelectionFromEvent}
						buttons={FREE_ROTATE_MODE_BUTTONS} />
				</fieldset>
				<FreeRotate
					angle={props.angle}
					center={props.rotatedCentering}
					disableCenter={freeRotateMode === 'with_bounds'}
					dispatch={dispatch} />
			</> : <></>}
		</>
	)
}, objectsAreEqual)

const RotationPanel = props => {
	const { id, multipleItems, multipleItemsSelected, dispatch } = props

	// eslint-disable-next-line no-extra-parens
	const settingsMenu = useMemo(() => (
		createSettingsMenu(multipleItems, multipleItemsSelected, [
			() => dispatch(copyAttributes(id, extractRelevantMediaProps, extractRotationProps)),
			() => dispatch(applyToSelection(id, extractRelevantMediaProps, extractRotationProps)),
			() => dispatch(applyToAll(id, extractRelevantMediaProps, extractRotationProps)),
			() => dispatch(saveAsPreset(id, extractRelevantMediaProps, extractRotationProps))
		])
	), [multipleItems, multipleItemsSelected, id])

	return (
		<AccordionPanel
			heading="Rotation"
			id="rotation"
			className="editor-options"
			buttons={settingsMenu}>
			<Rotation {...props} />
		</AccordionPanel>
	)
}

const propTypes = {
	id: string,
	multipleItems: bool.isRequired,
	multipleItemsSelected: bool.isRequired,
	transpose: oneOf(['', 'transpose=1', 'transpose=2,transpose=2', 'transpose=2']),
	reflect: oneOf(['', 'hflip', 'vflip', 'hflip,vflip']),
	freeRotateMode: oneOf(['inside_bounds', 'with_bounds']),
	angle: number.isRequired,
	rotatedCentering: number.isRequired,
	showFreeRotate: bool.isRequired,
	dispatch: func.isRequired
}

Rotation.propTypes = propTypes
RotationPanel.propTypes = propTypes

export default RotationPanel
