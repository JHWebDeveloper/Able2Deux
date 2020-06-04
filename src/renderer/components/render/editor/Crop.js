import React, { memo, useCallback } from 'react'
import { bool, func, number, exact, string } from 'prop-types'

import {
	updateMediaNestedState,
	updateMediaNestedStateFromEvent
} from '../../../actions'

import {
	copySettings,
	applySettingsToAll,
	updateCropBiDirectional
} from '../../../actions/render'

import { compareProps, createSettingsMenu } from '../../../utilities'

import DetailsWrapper from '../../form_elements/DetailsWrapper'
import SliderPair from '../../form_elements/SliderPair'

const Crop = memo(({ id, onlyItem, crop, editAll, dispatch }) => {
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
			buttons={onlyItem ? false : createSettingsMenu([
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
						value: crop.t,
						inverted: invertedTB,
						...sliderProps
					},
					{
						label: 'B',
						name: 'b',
						value: crop.b,
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
						value: crop.l,
						inverted: invertedLR,
						...sliderProps
					},
					{
						label: 'R',
						name: 'r',
						value: crop.r,
						inverted: invertedLR,
						...sliderProps
					}
				]} />
		</DetailsWrapper>
	)
}, compareProps)

Crop.propTypes = {
	id: string.isRequired,
	onlyItem: bool.isRequired,
	crop: exact({
		t: number,
		b: number,
		r: number,
		l: number,
		linkTB: bool,
		linkLR: bool
	}).isRequired,
	editAll: bool.isRequired,
	dispatch: func.isRequired
}

export default Crop
