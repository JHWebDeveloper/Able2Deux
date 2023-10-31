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

import { RADIO_SET } from 'constants'

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
	const backgroundButtons = RADIO_SET.background.slice(0, 7)

	if (!enable11pmBackgrounds) backgroundButtons.splice(2, 4)

	return backgroundButtons
}

const extractFramingProps = createObjectPicker(['arc', 'background', 'bgColor', 'backgroundMotion', 'overlay'])

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

const Framing = memo(props => {
	const { enable11pmBackgrounds } = useContext(PrefsContext).preferences
	const { arc, background, bgColor, overlay, eyedropper, setEyedropper, updateSelectionFromEvent, dispatch } = props
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
				options={RADIO_SET.arc} />
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
				state={props.backgroundMotion}
				onChange={updateSelectionFromEvent}
				options={RADIO_SET.backgroundMotion} />
			<RadioSet
				label="Box Overlay"
				name="overlay"
				disabled={arc === 'none'}
				state={overlay}
				onChange={updateSelectionFromEvent}
				options={RADIO_SET.overlay}/>
		</>
	)
}, objectsAreEqual)

const FramingPanel = props => {
	const { id, multipleItems, multipleItemsSelected, dispatch } = props

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
			className="editor-options"
			buttons={settingsMenu}
			initOpen>
			<Framing {...props} />
		</AccordionPanel>
	)
}

BackgroundColorPicker.propTypes = {
	bgColor: string.isRequired,
	updateBgColor: func.isRequired,
	selectBgColor: func.isRequired,
	eyedropperActive: bool.isRequired
}

const propTypes = {
	id: string.isRequired,
	multipleItems: bool.isRequired,
	multipleItemsSelected: bool.isRequired,
	arc: oneOf(['none', 'fit', 'fill', 'transform']).isRequired,
	background: oneOf(['blue', 'grey', 'light_blue', 'dark_blue', 'teal', 'tan', 'alpha', 'color']).isRequired,
	backgroundMotion: oneOf(['animated', 'still', 'auto']).isRequired,
	bgColor: string.isRequired,
	overlay: oneOf(['none', 'tv', 'laptop']),
	eyedropper: exact({
		active: oneOf([false, 'white', 'black', 'key', 'background']),
		pixelData: oneOfType([bool, exact({
			r: string,
			g: string,
			b: string
		})])
	}).isRequired,
	setEyedropper: func.isRequired,
	mediaType: oneOf(['video', 'image', 'gif', 'audio']),
	updateSelectionFromEvent: func.isRequired,
	dispatch: func.isRequired
}

Framing.propTypes = propTypes
FramingPanel.propTypes = propTypes

export default FramingPanel
