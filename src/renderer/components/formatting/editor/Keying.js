import React, { memo, useCallback } from 'react'
import { bool, exact, func, number, string } from 'prop-types'

import {
	toggleMediaNestedCheckbox,
	updateMediaNestedState,
	updateMediaNestedStateFromEvent,
	copySettings,
	applySettingsToAll
} from 'actions'

import { compareProps, createSettingsMenu } from 'utilities'

import DetailsWrapper from '../../form_elements/DetailsWrapper'
import RadioSet from '../../form_elements/RadioSet'
import ColorInput from '../../form_elements/ColorInput'
import NumberInput from '../../form_elements/NumberInput'
import SingleSlider from '../../form_elements/SliderSingle'
import Checkbox from '../../form_elements/Checkbox'

const similarityStaticProps = { name: 'similarity', title: 'Similarity', min: 1, max: 100 }
const blendStaticProps = { name: 'blend', title: 'Blend', min: 0, max: 100 }

const keyTypeButtons = [
	{
		label: 'Color Key',
		value: 'colorkey'
	},
	{
		label: 'Chroma Key',
		value: 'chromakey'
	}
]

const Keying = memo(({ id, keying, editAll, isBatch, dispatch }) => {
	const { enabled, hidden } = keying

	const toggleKeyingCheckbox = useCallback(e => {
		dispatch(toggleMediaNestedCheckbox(id, 'keying', e, editAll))
	}, [id, editAll])

	const updateKeying = useCallback(({ name, value }) => {
		dispatch(updateMediaNestedState(id, 'keying', {
			[name]: value
		}, editAll))
	}, [id, editAll])

	const updateKeyingFromEvent = useCallback(e => {
		dispatch(updateMediaNestedStateFromEvent(id, 'keying', e, editAll))
	}, [id, editAll])

	const similarityProps = {
		...similarityStaticProps,
		value: keying.similarity,
		onChange: updateKeying,
		disabled: !enabled
	}

	const blendProps = {
		...blendStaticProps,
		value: keying.blend,
		onChange: updateKeying,
		disabled: !enabled
	}

	return (
		<DetailsWrapper
			summary="Key"
			className="editor-panel auto-rows keying-panel"
			buttons={isBatch ? createSettingsMenu([
				() => dispatch(copySettings({ keying })),
				() => dispatch(applySettingsToAll(id, { keying }))
			]) : []}>
			<div className="on-off-switch">
				<Checkbox
					name="enabled"
					title={`Turn keying ${enabled ? 'off' : 'on'}`}
					checked={enabled}
					onChange={toggleKeyingCheckbox}
					switchIcon />
			</div>
			<fieldset
				className="editor-option-column"
				disabled={!enabled}>
				<legend>Type:</legend>
				<RadioSet
					name="type"
					state={keying.type}
					onChange={updateKeyingFromEvent}
					buttons={keyTypeButtons}/>
			</fieldset>
			<div className={`color-picker-with-toggle ${enabled ? '' : 'disabled'}`}>
				<label id="key-color">Color:</label>
				<ColorInput
					name="color"
					value={keying.color}
					onChange={updateKeying}
					disabled={!enabled}
					ariaLabelledby="key-color" />
				<Checkbox
					name="hidden"
					title={`Show ${hidden ? 'effect' : 'original'}`}
					checked={hidden}
					onChange={toggleKeyingCheckbox}
					disabled={!enabled}
					visibleIcon />
			</div>
			<div className={`color-sliders-panel${enabled ? '' : ' disabled'}`}>
				<label>Similarity</label>
				<SingleSlider {...similarityProps} />
				<NumberInput {...similarityProps} />
				<label>Blend</label>
				<SingleSlider {...blendProps} />
				<NumberInput {...blendProps} />
			</div>
		</DetailsWrapper>
	)
}, compareProps)

Keying.propTypes = {
	id: string.isRequired,
	keying: exact({
		blend: number,
		color: string,
		enabled: bool,
		hidden: bool,
		similarity: number,
		type: string
	}).isRequired,
	editAll: bool.isRequired,
	isBatch: bool.isRequired,
	dispatch: func.isRequired
}

export default Keying
