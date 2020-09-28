import React, { memo, useCallback } from 'react'
import { bool, exact, func, number, oneOf, oneOfType, string } from 'prop-types'

import {
	updateMediaNestedState,
	updateMediaNestedStateFromEvent,
	copySettings,
	applySettingsToAll,
	updateCropBiDirectional
} from '../../../actions'

import { compareProps, createSettingsMenu } from '../../../utilities'

import DetailsWrapper from '../../form_elements/DetailsWrapper'
import SliderPair from '../../form_elements/SliderPair'

const Crop = memo(({ id, isBatch, crop, editAll, dispatch }) => {
	const updateCrop = useCallback(e => {
		dispatch(updateMediaNestedStateFromEvent(id, 'crop', e, editAll))
	}, [id, editAll])

	const toggleCropLink = useCallback(axis => {
		dispatch(updateMediaNestedState(id, 'crop', {
			[axis]: !crop[axis]
		}, editAll))
	}, [id, crop, editAll])

	const sliderProps = {
		min: 0,
		max: 100,
		onChange: updateCrop
	}

	const invertedTB = crop.t > 100 - crop.b
	const invertedLR = crop.l > 100 - crop.r

	return (
		<DetailsWrapper
			summary="Crop"
			buttons={isBatch && createSettingsMenu([
				() => dispatch(copySettings({ crop })),
				() => dispatch(applySettingsToAll(id, { crop }))
			])}>
			<SliderPair
				link={crop.linkTB}
				linkAction={() => toggleCropLink('linkTB')}
				pairAction={e => dispatch(updateCropBiDirectional(id, editAll, 't', 'b', e))}
				sliders={[
					{
						label: 'T',
						name: 't',
						value: parseFloat(crop.t) ?? 0,
						inverted: invertedTB,
						...sliderProps
					},
					{
						label: 'B',
						name: 'b',
						value: parseFloat(crop.b) ?? 0,
						inverted: invertedTB,
						...sliderProps
					}
				]} />
			<SliderPair
				link={crop.linkLR}
				linkAction={() => toggleCropLink('linkLR')}
				pairAction={e => dispatch(updateCropBiDirectional(id, editAll, 'l', 'r', e))}
				sliders={[
					{
						label: 'L',
						name: 'l',
						value: parseFloat(crop.l) || 0,
						inverted: invertedLR,
						...sliderProps
					},
					{
						label: 'R',
						name: 'r',
						value: parseFloat(crop.r) || 0,
						inverted: invertedLR,
						...sliderProps
					}
				]} />
		</DetailsWrapper>
	)
}, compareProps)

Crop.propTypes = {
	id: string.isRequired,
	isBatch: bool.isRequired,
	crop: exact({
		t: oneOfType([oneOf(['']), number]),
		b: oneOfType([oneOf(['']), number]),
		r: oneOfType([oneOf(['']), number]),
		l: oneOfType([oneOf(['']), number]),
		linkTB: bool,
		linkLR: bool
	}).isRequired,
	editAll: bool.isRequired,
	dispatch: func.isRequired
}

export default Crop
