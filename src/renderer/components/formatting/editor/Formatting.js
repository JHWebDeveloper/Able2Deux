import React, { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { bool, func, oneOf, string } from 'prop-types'

import {
	updateMediaState,
	updateMediaStateFromEvent,
	copySettings,
	applySettingsToAll
} from 'actions'

import { compareProps, createSettingsMenu, debounce } from 'utilities'

import DetailsWrapper from '../../form_elements/DetailsWrapper'
import RadioSet from '../../form_elements/RadioSet'

const formattingButtons = [
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

const backgroundButtons = [
	{
		label: 'Blue',
		value: 'blue'
	},
	{
		label: 'Grey',
		value: 'grey'
	},
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

const BgColorPicker = ({ value, onChange, onFocus }) => {
	const [ color, setColor ] = useState(value)

	const onChangeDebounce = useMemo(() => debounce(onChange, 60), [onChange])

	useEffect(() => {
		onChangeDebounce(color)
	}, [color])

	return (
		<input
			type="color"
			value={value}
			onChange={e => setColor(e.target.value)}
			onFocus={onFocus} />
	)
}

const Formatting = memo(props => {
	const { id, arc, background, bgColor, overlay, editAll, dispatch } = props

	const updateMediaStateDispatch = useCallback(e => {
		dispatch(updateMediaStateFromEvent(id, e, editAll))
	}, [id, editAll])

	const updateBgColor = useCallback(color => {
		dispatch(updateMediaState(id, {
			bgColor: color
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
			className="auto-columns"
			buttons={props.isBatch && createSettingsMenu([
				() => dispatch(copySettings({ arc, background, overlay })),
				() => dispatch(applySettingsToAll(id, { arc, background, overlay }))
			])}
			open>
			<fieldset>
				<legend>AR Correction:</legend>
				<RadioSet
					name="arc"
					state={arc}
					onChange={updateMediaStateDispatch}
					buttons={formattingButtons}/>
			</fieldset>
			<fieldset disabled={arc === 'none' || arc === 'fill' && !props.hasAlpha && overlay === 'none'}>
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
							component: <BgColorPicker
								value={bgColor}
								onChange={updateBgColor}
								onFocus={setRadioToColor} />
						}
					]}/>
			</fieldset>
			<fieldset disabled={arc === 'none'}>
				<legend>Box Overlay:</legend>
				<RadioSet
					name="overlay"
					state={overlay}
					onChange={updateMediaStateDispatch}
					buttons={overlayButtons}/>
			</fieldset>
		</DetailsWrapper>
	)
}, compareProps)

BgColorPicker.propTypes = {
	value: string.isRequired,
	onChange: func.isRequired,
	onFocus: func
}

Formatting.propTypes = {
	id: string.isRequired,
	isBatch: bool.isRequired,
	hasAlpha: bool.isRequired,
	arc: oneOf(['none', 'fit', 'fill', 'transform']).isRequired,
	background: oneOf(['blue', 'grey', 'alpha', 'color']).isRequired,
	bgColor: string.isRequired,
	overlay: oneOf(['none', 'tv', 'laptop']),
	mediaType: oneOf(['video', 'image', 'gif', 'audio']),
	editAll: bool.isRequired,
	dispatch: func.isRequired
}


export default Formatting
