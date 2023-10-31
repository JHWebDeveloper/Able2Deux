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

import { RADIO_SET } from 'constants'

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

const createReflectButtons = isSideways => {
	const reflectButtons = [...RADIO_SET.reflect]

	reflectButtons[1].value = isSideways ? 'vflip' : 'hflip'
	reflectButtons[2].value = isSideways ? 'hflip' : 'vflip'

	return reflectButtons
}

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
			<RadioSet
				label="Reflect"
				name="reflect"
				state={reflect}
				onChange={updateReflectMedia}
				options={reflectButtons} />
			<RadioSet
				label="Rotate"
				name="transpose"
				state={transpose}
				onChange={updateRotateMedia}
				options={RADIO_SET.transpose}/>
			{props.showFreeRotate ? <>
				<RadioSet
					label="Free Rotate Mode"
					name="freeRotateMode"
					state={freeRotateMode}
					onChange={updateSelectionFromEvent}
					options={RADIO_SET.freeRotateMode} />
				<FreeRotate
					angle={props.angle}
					center={props.rotatedCentering}
					disableCenter={freeRotateMode === 'with_bounds'}
					updateSelectionFromEvent={updateSelectionFromEvent} />
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
			options={settingsMenu}>
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
	updateSelectionFromEvent: func.isRequired,
	dispatch: func.isRequired
}

Rotation.propTypes = propTypes
RotationPanel.propTypes = propTypes

export default RotationPanel
