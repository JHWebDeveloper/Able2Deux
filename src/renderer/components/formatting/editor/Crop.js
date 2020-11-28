import React, { memo, useCallback, useMemo } from 'react'
import { bool, exact, func, number, oneOf, oneOfType, string } from 'prop-types'

import {
	updateMediaNestedState,
	toggleMediaNestedCheckbox,
	copySettings,
	applySettingsToAll
} from 'actions'

import { clamp, compareProps, createSettingsMenu } from 'utilities'

import DetailsWrapper from '../../form_elements/DetailsWrapper'
import SliderDouble from '../../form_elements/SliderDouble'
import NumberInput from '../../form_elements/NumberInput'
import LinkIcon from '../../svg/LinkIcon'

const propsTStatic = { name: 't', title: 'Crop Top' }
const propsBStatic = { name: 'b', title: 'Crop Bottom' }
const propsLStatic = { name: 'l', title: 'Crop Left' }
const propsRStatic = { name: 'r', title: 'Crop Right' }

const sliderProps = {
	snapPoints: [25, 33.33, 50, 66.67, 75],
	sensitivity: 2,
	enableAutoCenter: true
}

const Crop = memo(({ id, isBatch, crop, editAll, dispatch }) => {
	const updateCrop = useCallback(({ name, value }) => {
		dispatch(updateMediaNestedState(id, 'crop', {
			[name]: value
		}, editAll))
	}, [id, editAll])

	const updateCropBiDirectional = useCallback((d1, d2, { name, value }) => {
		const isD1 = name === d1
		const compliment = crop[d2] - value + crop[d1]
		const bound = crop[d1] + (crop[d2] - crop[d1]) / 2

		dispatch(updateMediaNestedState(id, 'crop', {
			[d1]: clamp(isD1 ? value : compliment, 0, bound - 0.025),
			[d2]: clamp(isD1 ? compliment : value, bound + 0.025, 100)
		}, editAll))
	}, [crop, id, editAll])

	const pan = useCallback((d1, d2, { valueL, valueR }) => {
		dispatch(updateMediaNestedState(id, 'crop', {
			[d1]: valueL,
			[d2]: valueR
		}, editAll))
	}, [id, editAll])

	const panX = useCallback(values => pan('l', 'r', values), [id, editAll])
	const panY = useCallback(values => pan('t', 'b', values), [id, editAll])

	const toggleCropLink = useCallback(e => {
		dispatch(toggleMediaNestedCheckbox(id, 'crop', e, editAll))
	}, [id, editAll])

	const propsTB = useMemo(() => ({
		onChange: crop.linkTB
			? vals => updateCropBiDirectional('t', 'b', vals)
			: updateCrop
	}), [crop, id, editAll])

	const propsLR = useMemo(() => ({
		onChange: crop.linkLR
			? vals => updateCropBiDirectional('l', 'r', vals)
			: updateCrop
	}), [crop, id, editAll])

	const propsT = {
		...propsTStatic,
		...propsTB,
		value: crop.t
	}

	const propsB = {
		...propsBStatic,
		...propsTB,
		value: crop.b
	}

	const propsL = {
		...propsLStatic,
		...propsLR,
		value: crop.l
	}

	const propsR = {
		...propsRStatic,
		...propsLR,
		value: crop.r
	}

	return (
		<DetailsWrapper
			summary="Crop"
			className="double-slider-grid"
			buttons={isBatch && createSettingsMenu([
				() => dispatch(copySettings({ crop })),
				() => dispatch(applySettingsToAll(id, { crop }))
			])}>
			<label>T</label>
			<NumberInput
				max={crop.b - 0.05}
				defaultValue={0}
				{...propsT} />
			<SliderDouble
				leftThumb={propsT}
				rightThumb={propsB}
				onPan={panY}
				middleThumbTitle="Pan Y"
				{...sliderProps} />
			<NumberInput
				min={crop.t + 0.05}
				defaultValue={100}
				{...propsB} />
			<label>B</label>
			<button
				type="button"
				name="linkTB"
				title={`${crop.linkTB ? 'Unl' : 'L'}ink Top and Bottom`}
				onClick={toggleCropLink}>
				<LinkIcon linked={crop.linkTB} single />
			</button>
			<label>L</label>
			<NumberInput
				max={crop.r - 0.05}
				defaultValue={0}
				{...propsL} />
			<SliderDouble
				leftThumb={propsL}
				rightThumb={propsR}
				onPan={panX}
				middleThumbTitle="Pan X"
				{...sliderProps} />
			<NumberInput
				min={crop.l + 0.05}
				defaultValue={100}
				{...propsR} />
			<label>R</label>
			<button
				type="button"
				name="linkLR"
				title={`${crop.linkLR ? 'Unl' : 'L'}ink Left and Right`}
				onClick={toggleCropLink}>
				<LinkIcon linked={crop.linkLR} single />
			</button>
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
