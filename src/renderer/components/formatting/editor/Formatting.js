import React, { memo, useCallback, useContext, useMemo } from 'react'
import { bool, func, oneOf, string } from 'prop-types'

import { PrefsContext } from 'store/preferences'

import {
	updateMediaState,
	updateMediaStateFromEvent,
	copySettings,
	applySettingsToAll
} from 'actions'

import { compareProps, createSettingsMenu } from 'utilities'

import DetailsWrapper from '../../form_elements/DetailsWrapper'
import RadioSet from '../../form_elements/RadioSet'
import ColorInput from '../../form_elements/ColorInput'

const arcButtons = [
	{
		label: 'None',
		value: 'none'
	},
	{
		label: 'Fill Frame',
		value: 'fill'
	},
	{
		label: 'Fit in Frame',
		value: 'fit'
	},
	{
		label: 'Transform',
		value: 'transform'
	}
]

const createBackgroundButtons = enable11pmBackgrounds => [
	{
		label: 'Blue',
		value: 'blue'
	},
	{
		label: 'Grey',
		value: 'grey'
	},
	...enable11pmBackgrounds ? [
		{
			label: '11pm Blue 1',
			value: 'light_blue'
		},
		{
			label: '11pm Blue 2',
			value: 'dark_blue'
		},
		{
			label: '11pm Teal',
			value: 'teal'
		},
		{
			label: '11pm Tan',
			value: 'tan'
		}
	] : [],
	{
		label: 'Transparent',
		value: 'alpha'
	}
]

const overlayButtons = [
	{
		label: 'None',
		value: 'none'
	},
	{
		label: 'TV',
		value: 'tv'
	},
	{
		label: 'Laptop',
		value: 'laptop'
	}
]

const backgroundMotionButtons = [
	{
		label: 'Animated',
		value: 'animated'
	},
	{
		label: 'Still',
		value: 'still'
	}
]

const Formatting = memo(props => {
	const { id, arc, background, bgColor, overlay, editAll, dispatch } = props
	const { enable11pmBackgrounds } = useContext(PrefsContext).preferences

	const updateMediaStateDispatch = useCallback(e => {
		dispatch(updateMediaStateFromEvent(id, e, editAll))
	}, [id, editAll])

	const backgroundButtons = useMemo(() => createBackgroundButtons(enable11pmBackgrounds), [enable11pmBackgrounds])

	const updateBgColor = useCallback(({ name, value }) => {
		dispatch(updateMediaState(id, {
			[name]: value
		}, editAll))
	}, [id, editAll])

	const setRadioToColor = useCallback(() => {
		dispatch(updateMediaState(id, {
			background: 'color'
		}, editAll))
	}, [id, editAll])

	return (
		<DetailsWrapper
			summary="Formatting"
			className="editor-panel formatting-panel"
			buttons={props.isBatch ? createSettingsMenu([
				() => dispatch(copySettings({ arc, background, overlay })),
				() => dispatch(applySettingsToAll(id, { arc, background, overlay }))
			]) : []}
			open>
			<fieldset className="editor-option-column">
				<legend>AR Correction:</legend>
				<RadioSet
					name="arc"
					state={arc}
					onChange={updateMediaStateDispatch}
					buttons={arcButtons}/>
			</fieldset>
			<fieldset
				className="editor-option-column"
				disabled={arc === 'none'}>
				<legend>Background:</legend>
				<RadioSet
					name="background"
					state={background}
					onChange={updateMediaStateDispatch}
					buttons={[
						...backgroundButtons,
						{
							label: 'Color',
							value: 'color',
							component: <ColorInput
								name="bgColor"
								title="Select background color"
								value={bgColor}
								onChange={updateBgColor}
								onFocus={setRadioToColor} />
						}
					]}/>
			</fieldset>
			<fieldset
				className="editor-option-column"
				disabled={arc === 'none'}>
				<legend>Box Overlay:</legend>
				<RadioSet
					name="overlay"
					state={overlay}
					onChange={updateMediaStateDispatch}
					buttons={overlayButtons}/>
			</fieldset>
			<fieldset
				className="editor-option-column"
				disabled={arc === 'none' || background === 'alpha' || background === 'color'}>
				<legend>BG Motion:</legend>
				<RadioSet
					name="backgroundMotion"
					state={props.backgroundMotion}
					onChange={updateMediaStateDispatch}
					buttons={backgroundMotionButtons}/>
			</fieldset>
		</DetailsWrapper>
	)
}, compareProps)

Formatting.propTypes = {
	id: string.isRequired,
	isBatch: bool.isRequired,
	arc: oneOf(['none', 'fit', 'fill', 'transform']).isRequired,
	background: oneOf(['blue', 'grey', 'light_blue', 'dar_blue', 'teal', 'tan', 'alpha', 'color']).isRequired,
	backgroundMotion: oneOf(['animated', 'still', 'auto']).isRequired,
	bgColor: string.isRequired,
	overlay: oneOf(['none', 'tv', 'laptop']),
	mediaType: oneOf(['video', 'image', 'gif', 'audio']),
	editAll: bool.isRequired,
	dispatch: func.isRequired
}


export default Formatting
