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

import { OPTION_SET } from 'constants'

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
	const reflectButtons = [...OPTION_SET.reflect]

	reflectButtons[1].value = isSideways ? 'vflip' : 'hflip'
	reflectButtons[2].value = isSideways ? 'hflip' : 'vflip'

	return reflectButtons
}

const extractRotationProps = createObjectPicker(['transpose', 'reflect', 'freeRotateMode', 'angle', 'rotatedCentering'])

const Rotation = memo(({
	transpose,
	reflect,
	showFreeRotate,
	freeRotateMode,
	angle,
	rotatedCentering,
	updateSelectionFromEvent,
	dispatch
}) => {
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
				options={OPTION_SET.transpose}/>
			{showFreeRotate ? <>
				<RadioSet
					label="Free Rotate Mode"
					name="freeRotateMode"
					state={freeRotateMode}
					onChange={updateSelectionFromEvent}
					options={OPTION_SET.freeRotateMode} />
				<FreeRotate
					angle={angle}
					center={rotatedCentering}
					disableCenter={freeRotateMode === 'with_bounds'}
					updateSelectionFromEvent={updateSelectionFromEvent} />
			</> : <></>}
		</>
	)
}, objectsAreEqual)

const RotationPanel = ({ id, multipleItems, multipleItemsSelected, ...rest }) => {
	const { dispatch } = rest

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
			<Rotation {...rest} />
		</AccordionPanel>
	)
}

const sharedPropTypes = {
	transpose: oneOf(['', 'transpose=1', 'transpose=2,transpose=2', 'transpose=2']),
	reflect: oneOf(['', 'hflip', 'vflip', 'hflip,vflip']),
	freeRotateMode: oneOf(['inside_bounds', 'with_bounds']),
	angle: number.isRequired,
	rotatedCentering: number.isRequired,
	showFreeRotate: bool.isRequired,
	updateSelectionFromEvent: func.isRequired,
	dispatch: func.isRequired
}

RotationPanel.propTypes = {
	...sharedPropTypes,
	id: string,
	multipleItems: bool.isRequired,
	multipleItemsSelected: bool.isRequired
}

Rotation.propTypes = sharedPropTypes

export default RotationPanel
