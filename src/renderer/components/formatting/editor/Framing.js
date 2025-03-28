import React, { memo, useCallback, useContext, useEffect, useMemo } from 'react'
import { bool, exact, func, oneOf, oneOfType, string } from 'prop-types'

import { PrefsContext } from 'store'

import {
	applyToAll,
	applyToSelection,
	copyAttributes,
	saveAsPreset,
	updateMediaStateBySelection
} from 'actions'

import { MEDIA_TYPES, OPTION_SET } from 'constants'

import {
	classNameBuilder,
	createObjectPicker,
	createSettingsMenu,
	objectsAreEqual,
	rgbToHex
} from 'utilities'

import AccordionPanel from '../../form_elements/AccordionPanel'
import RadioSet from '../../form_elements/RadioSet'
import ColorInput from '../../form_elements/ColorInput'
import EyedropperIcon from '../../svg/EyedropperIcon'

const createBackgroundButtons = enable11pmBackgrounds => {
	const backgroundButtons = OPTION_SET.background.slice(0, 6)

	if (!enable11pmBackgrounds) backgroundButtons.splice(1, 4)

	return backgroundButtons
}

const extractFramingProps = createObjectPicker(['arc', 'background', 'bgColor', 'backgroundMotion'])

const BackgroundColorPicker = ({ bgColor, updateBgColor, selectBgColor, eyedropperActive }) => (
	<div className="color-picker">
		<ColorInput
			name="bgColor"
			title="Select Background Color"
			value={bgColor}
			onChange={updateBgColor} />
		<button
			type="button"
			title="Select Background Color"
			aria-label="Select Background Color"
			className={classNameBuilder({
				'eyedropper-btn': true,
				'eyedropper-active': eyedropperActive
			})}
			onClick={selectBgColor}>
			<EyedropperIcon hideContents />
		</button>
	</div>
)

const Framing = memo(({
	arc,
	background,
	bgColor,
	backgroundMotion,
	eyedropper,
	setEyedropper,
	updateSelectionFromEvent,
	dispatch
}) => {
	const { enable11pmBackgrounds } = useContext(PrefsContext).preferences
	const { active, pixelData } = eyedropper

	const backgroundButtons = useMemo(() => createBackgroundButtons(enable11pmBackgrounds), [enable11pmBackgrounds])

	const selectBgColor = useCallback(() => {
		setEyedropper(({ active }) => ({
			active: active === 'background' ? false : 'background',
			pixelData: false
		}))
	}, [])

	useEffect(() => {
		if (active === 'background' && pixelData) {
			dispatch(updateMediaStateBySelection({
				bgColor: rgbToHex(pixelData),
				background: 'color'
			}))

			setEyedropper({ active: false, pixelData: false })
		}
	}, [eyedropper])

	return (
		<>
			<RadioSet
				label="AR Correction"
				name="arc"
				state={arc}
				onChange={updateSelectionFromEvent}
				options={OPTION_SET.arc} />
			<RadioSet
				label="Background"
				name="background"
				disabled={arc === 'none'}
				state={background}
				onChange={updateSelectionFromEvent}
				options={[
					...backgroundButtons,
					{
						label: 'Color',
						value: 'color',
						component: <BackgroundColorPicker
							bgColor={bgColor}
							updateBgColor={updateSelectionFromEvent}
							selectBgColor={selectBgColor}
							eyedropperActive={active === 'background'} />
					}
				]} />
			<RadioSet
				label="BG Motion"
				name="backgroundMotion"
				disabled={arc === 'none' || background === 'alpha' || background === 'color'}
				state={backgroundMotion}
				onChange={updateSelectionFromEvent}
				options={OPTION_SET.backgroundMotion} />
		</>
	)
}, objectsAreEqual)

const FramingPanel = ({ id, multipleItems, multipleItemsSelected, ...rest }) => {
	const { dispatch } = rest

	// eslint-disable-next-line no-extra-parens
	const settingsMenu = useMemo(() => (
		createSettingsMenu(multipleItems, multipleItemsSelected, [
			() => dispatch(copyAttributes(id, extractFramingProps)),
			() => dispatch(applyToSelection(id, extractFramingProps)),
			() => dispatch(applyToAll(id, extractFramingProps)),
			() => dispatch(saveAsPreset(id, extractFramingProps))
		])
	), [multipleItems, multipleItemsSelected, id])

	return (
		<AccordionPanel
			heading="Framing"
			id="framing"
			className="editor-options auto-columns"
			options={settingsMenu}
			initOpen>
			<Framing {...rest} />
		</AccordionPanel>
	)
}

BackgroundColorPicker.propTypes = {
	bgColor: string.isRequired,
	updateBgColor: func.isRequired,
	selectBgColor: func.isRequired,
	eyedropperActive: bool.isRequired
}

const sharedPropTypes = {
	arc: oneOf(['none', 'fit', 'fill', 'transform']).isRequired,
	background: oneOf(['blue', 'light_blue', 'dark_blue', 'teal', 'tan', 'alpha', 'color']).isRequired,
	backgroundMotion: oneOf(['animated', 'still', 'auto']).isRequired,
	bgColor: string.isRequired,
	eyedropper: exact({
		active: oneOf([false, 'white', 'black', 'key', 'background']),
		pixelData: oneOfType([bool, exact({
			r: string,
			g: string,
			b: string
		})])
	}).isRequired,
	setEyedropper: func.isRequired,
	mediaType: oneOf(MEDIA_TYPES),
	updateSelectionFromEvent: func.isRequired,
	dispatch: func.isRequired
}

FramingPanel.propTypes = {
	...sharedPropTypes,
	id: string.isRequired,
	multipleItems: bool.isRequired,
	multipleItemsSelected: bool.isRequired
}

Framing.propTypes = sharedPropTypes

export default FramingPanel
