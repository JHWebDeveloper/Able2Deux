import React, { memo, useCallback } from 'react'

import 'css/index/key_and_cc.css'

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
  const { disabled, hidden } = keying

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
    disabled
  }

  const blendProps = {
    ...blendStaticProps,
    value: keying.blend,
    onChange: updateKeying,
    disabled
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
          name="disabled"
          title={`Turn keying ${disabled ? 'on' : 'off' }`}
          checked={!disabled}
          onChange={toggleKeyingCheckbox}
          switchIcon />
      </div>
      <fieldset
        className="editor-option-column"
        disabled={disabled}>
        <legend>Type:</legend>
        <RadioSet
          name="type"
          state={keying.type}
          onChange={updateKeyingFromEvent}
          buttons={keyTypeButtons}/>
      </fieldset>
      <div className={`color-picker-with-toggle ${disabled ? 'disabled' : ''}`}>
        <label id="key-color">Color:</label>
        <ColorInput
          name="color"
          value={keying.color}
          onChange={updateKeying}
          disabled={disabled}
          ariaLabelledby="key-color" />
        <Checkbox
          name="hidden"
          title={`Show ${hidden ? 'effect' : 'original'}`}
          checked={hidden}
          onChange={toggleKeyingCheckbox}
          disabled={disabled}
          visibleIcon />
      </div>
      <div className={`color-sliders-panel${disabled ? ' disabled' : ''}`}>
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

export default Keying