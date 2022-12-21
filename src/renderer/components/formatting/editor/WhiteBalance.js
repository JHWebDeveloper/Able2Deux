import React, { memo, useCallback } from 'react'

import {
  toggleMediaNestedCheckbox,
  updateMediaNestedState,
  copySettings,
  applySettingsToAll
} from 'actions'

import { compareProps, createSettingsMenu } from 'utilities'

import DetailsWrapper from '../../form_elements/DetailsWrapper'
import Checkbox from '../../form_elements/Checkbox'
import ColorInput from '../../form_elements/ColorInput'
import SingleSlider from '../../form_elements/SliderSingle'
import NumberInput from '../../form_elements/NumberInput'

const intensityStaticProps = { name: 'intensity', title: 'Intensity', min: 0, max: 100 }

const WhiteBalance = memo(({ id, whiteBalance, editAll, isBatch, dispatch }) => {
  const { whiteDisabled, whiteHidden, whitept, blackDisabled, blackHidden, blackpt } = whiteBalance
  const fullyDisabled = whiteDisabled && blackDisabled

  const toggleWhiteBalanceCheckbox = useCallback(e => {
		dispatch(toggleMediaNestedCheckbox(id, 'whiteBalance', e, editAll))
	}, [id, editAll])

  const updateWhiteBalance = useCallback(({ name, value }) => {
		dispatch(updateMediaNestedState(id, 'whiteBalance', {
			[name]: value
		}, editAll))
	}, [id, editAll])

  const intensityProps = {
    ...intensityStaticProps,
    value: whiteBalance.intensity,
    onChange: updateWhiteBalance,
    disabled: fullyDisabled
  }

  return (
    <DetailsWrapper
      summary="White Balance"
      className="editor-panel auto-rows white-balance-panel"
      buttons={isBatch ? createSettingsMenu([
				() => dispatch(copySettings({ whiteBalance })),
				() => dispatch(applySettingsToAll(id, { whiteBalance }))
			]) : []}>
      <div className="on-off-switch">
        <Checkbox
          name="whiteDisabled"
          title={`Turn white point ${whiteDisabled ? 'on' : 'off' }`}
          checked={!whiteDisabled}
          onChange={toggleWhiteBalanceCheckbox}
          switchIcon />
      </div>
      <div className={`color-picker-with-toggle${whiteDisabled ? ' disabled' : ''}`}>
        <label id="white-pt">White Point:</label>
        <ColorInput
          name="whitept"
          value={whitept}
          onChange={updateWhiteBalance}
          disabled={whiteDisabled}
          ariaLabelledby="white-pt" />
        <Checkbox
          name="whiteHidden"
          title={`Show ${whiteHidden ? 'effect' : 'original'}`}
          checked={whiteHidden}
          disabled={whiteDisabled}
          onChange={toggleWhiteBalanceCheckbox}
          visibleIcon />
      </div>
      <div className="on-off-switch">
        <Checkbox
          name="blackDisabled"
          title={`Turn black point ${blackDisabled ? 'on' : 'off' }`}
          checked={!blackDisabled}
          onChange={toggleWhiteBalanceCheckbox}
          switchIcon />
      </div>
      <div className={`color-picker-with-toggle${blackDisabled ? ' disabled' : ''}`}>
        <label id="black-pt">Black Point:</label>
        <ColorInput
          name="whitept"
          value={blackpt}
          onChange={updateWhiteBalance}
          disabled={blackDisabled}
          ariaLabelledby="black-pt" />
        <Checkbox
          name="whiteHidden"
          title={`Show ${blackHidden ? 'effect' : 'original'}`}
          checked={blackHidden}
          disabled={blackDisabled}
          onChange={toggleWhiteBalanceCheckbox}
          visibleIcon />
      </div>
      <div className={`color-sliders-panel${fullyDisabled ? ' disabled' : ''}`}>
        <label>Intenisty</label>
        <SingleSlider {...intensityProps}/>
        <NumberInput {...intensityProps}/>
      </div>
    </DetailsWrapper>
  )
}, compareProps)

export default WhiteBalance
