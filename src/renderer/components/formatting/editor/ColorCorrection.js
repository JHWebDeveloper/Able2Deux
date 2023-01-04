import React, { memo, useCallback, useEffect, useMemo } from 'react'
import { arrayOf, bool, exact, func, number, oneOf, string } from 'prop-types'

import {
	toggleMediaNestedCheckbox,
	updateMediaNestedStateFromEvent,
	addCurvePoint,
	addOrUpdateCurvePoint,
	deleteCurvePoint,
	resetCurve,
	colorBalance,
	cleanupCurve,
	copySettings,
	applySettingsToAll
} from 'actions'

import { compareProps, copyCurve, createSettingsMenu } from 'utilities'

import DetailsWrapper from '../../form_elements/DetailsWrapper'
import Checkbox from '../../form_elements/Checkbox'
import EyedropperIcon from '../../svg/EyedropperIcon'
import RadioSet from '../../form_elements/RadioSet'
import Curves from '../../form_elements/Curves'
import SliderDouble from '../../form_elements/SliderDouble'

const colorChannelButtons = [
	{
		label: 'RGB',
		value: 'rgb'
	},
	{
		label: 'R',
		value: 'r'
	},
	{
		label: 'G',
		value: 'g'
	},
	{
		label: 'B',
		value: 'b'
	}
]

const propsWhitePtStatic = {
	name: 'whitePt',
	title: 'White Point'
}

const propsBlackPtStatic = {
	name: 'blackPt',
	title: 'Black Point'
}

const getCurveColor = curveName => {
	switch (curveName) {
		case 'r':
			return '#f00'
		case 'g':
			return '#008000'
		case 'b':
			return '#00f'
		default:
			return '#000'
	}
}

const copyCurveSet = curveSet => ({
	...curveSet,
	rgb: copyCurve(curveSet.rgb),
	r: copyCurve(curveSet.r),
	g: copyCurve(curveSet.g),
	b: copyCurve(curveSet.b),
})

const ColorCorrection = memo(({ id, colorCurves, eyedropper, setEyedropper, isBatch, editAll, dispatch }) => {
	const { enabled, selectedCurve, rgb, r, g, b } = colorCurves

	const toggleCCCheckbox = useCallback(e => {
		dispatch(toggleMediaNestedCheckbox(id, 'colorCurves', e, editAll))
	}, [id, editAll])

	const toggleColorCorrection = useCallback(e => {
		if (eyedropper.active) {
			setEyedropper({ active: false, pixelData: false })
		}

		toggleCCCheckbox(e)
	}, [id, editAll, eyedropper.active])

	const selectCurve = useCallback(e => {
		dispatch(updateMediaNestedStateFromEvent(id, 'colorCurves', e))
	}, [id])

	const settingsMenu = useMemo(() => isBatch ? createSettingsMenu([
		() => dispatch(copySettings({
			colorCurves: copyCurveSet(colorCurves)
		})),
		() => dispatch(applySettingsToAll(id, {
			colorCurves: copyCurveSet(colorCurves)
		}))
	]) : [], [isBatch, id, colorCurves])

	// ---- Curves ----

	const dispatchAddCurvePoint = useCallback(pointData => {
		dispatch(addCurvePoint(id, selectedCurve, pointData, editAll))
	}, [id, selectedCurve, editAll])

	const dispatchAddOrUpdateCurvePoint = useCallback(pointData => {
		dispatch(addOrUpdateCurvePoint(id, selectedCurve, pointData, editAll))
	}, [id, selectedCurve, editAll])

	const dispatchDeleteCurvePoint = useCallback(pointId => {
		dispatch(deleteCurvePoint(id, selectedCurve, pointId, editAll))
	}, [id, selectedCurve, editAll])

	const dispatchCleanupCurve = useCallback(() => {
		dispatch(cleanupCurve(id, selectedCurve, editAll))
	}, [id, selectedCurve, editAll])

	const dispatchResetCurve = useCallback(e => {
		dispatch(resetCurve(id, e.shiftKey && selectedCurve, editAll))
	}, [id, selectedCurve, editAll])

	// ---- Curves Channels ----

	const curveColor = useMemo(() => getCurveColor(selectedCurve), [selectedCurve])

	// eslint-disable-next-line no-extra-parens
	const channelCurves = useMemo(() => selectedCurve === 'rgb' ? (
		['b', 'g', 'r'].reduce((acc, ch) => {
			const chCurve = colorCurves[ch]

			if (chCurve.length > 2 || chCurve[0].x > 0 || chCurve[0].y < 255 || chCurve[1].x < 255 || chCurve[1].y > 0) {
				acc.push({
					color: getCurveColor(ch),
					data: chCurve
				})
			}
				
			return acc
		}, [])
	) : [], [selectedCurve, r, g, b])

	// ---- White Balance Slider ----

	const blackPt = useMemo(() => colorCurves[selectedCurve][0], [selectedCurve, rgb, r, g, b])
	const whitePt = useMemo(() => colorCurves[selectedCurve].at(-1), [selectedCurve, rgb, r, g, b])

	const setBlackPoint = useCallback(({ value }) => {
		dispatch(addOrUpdateCurvePoint(id, selectedCurve, {
			...blackPt,
			x: value
		}, editAll))
	}, [id, selectedCurve, blackPt, editAll])

	const setWhitePoint = useCallback(({ value }) => {
		dispatch(addOrUpdateCurvePoint(id, selectedCurve, {
			...whitePt,
			x: value
		}, editAll))
	}, [id, selectedCurve, whitePt, editAll])

	/* ---- Eye Droppers ---- */

	const selectWhitePt = useCallback(() => {
		if (eyedropper.active === 'white') {
			setEyedropper({ active: false, pixelData: false })
		} else {
			setEyedropper({ active: 'white', pixelData: false })
		}
	}, [eyedropper.active])

	const selectBlackPt = useCallback(() => {
		if (eyedropper.active === 'black') {
			setEyedropper({ active: false, pixelData: false })
		} else {
			setEyedropper({ active: 'black', pixelData: false })
		}
	}, [eyedropper.active])

	useEffect(() => {
		if (eyedropper.active && eyedropper.pixelData) {
			dispatch(colorBalance(id, eyedropper, { r, g, b }, editAll))
			setEyedropper({ active: false, pixelData: false })
		}
	}, [id, eyedropper, r, g, b, editAll])

	return (
		<DetailsWrapper
			summary="Color Correction"
			className="editor-panel cc-panel"
			buttons={settingsMenu}>
			<div>
				<div className="on-off-switch">
					<Checkbox
						name="enabled"
						checked={enabled}
						onChange={toggleColorCorrection}
						switchIcon />
				</div>
				<button
					type="button"
					title="Select Black Point"
					className={eyedropper.active === 'black' ? 'eyedropper-active' : ''}
					onClick={selectBlackPt}
					disabled={!enabled}>
					<EyedropperIcon
						contentColor="#000"
						disabled={!enabled} />
				</button>
				<button
					type="button"
					title="Select White Point"
					className={eyedropper.active === 'white' ? 'eyedropper-active' : ''}
					onClick={selectWhitePt}
					disabled={!enabled}>
					<EyedropperIcon
						contentColor="#fff"
						disabled={!enabled} />
				</button>
				<Checkbox
					name="hidden"
					checked={colorCurves.hidden}
					onChange={toggleCCCheckbox}
					disabled={!enabled}
					visibleIcon />
				<button
					type="button"
					title="Reset Curves"
					className="symbol"
					onClick={dispatchResetCurve}
					disabled={!enabled}>format_color_reset</button>
			</div>
			<fieldset disabled={!enabled}>
				<legend>Color Channel</legend>
				<RadioSet
					name="selectedCurve"
					state={selectedCurve}
					buttons={colorChannelButtons}
					onChange={selectCurve} />
			</fieldset>
			<Curves
				curve={colorCurves[selectedCurve]}
				selectedCurve={selectedCurve}
				curveColor={curveColor}
				backgroundCurves={channelCurves}
				addCurvePoint={dispatchAddCurvePoint}
				addOrUpdateCurvePoint={dispatchAddOrUpdateCurvePoint}
				deleteCurvePoint={dispatchDeleteCurvePoint}
				cleanupCurve={dispatchCleanupCurve}
				disabled={!enabled} />
			<SliderDouble
				leftThumb={{
					...propsBlackPtStatic,
					value: blackPt.x,
					max: colorCurves[selectedCurve][1].x - 6,
					onChange: setBlackPoint
				}}
				rightThumb={{
					...propsWhitePtStatic,
					value: whitePt.x,
					min: colorCurves[selectedCurve].at(-2).x + 6,
					onChange: setWhitePoint
				}}
				min={0}
				max={255}
				fineTuneStep={1}
				disabled={!enabled} />
		</DetailsWrapper>
	)
}, compareProps)

const pointPropType = exact({
	id: string,
	hidden: bool,
	limit: bool,
	x: number,
	y: number
})

ColorCorrection.propTypes = {
	id: string.isRequired,
	colorCurves: exact({
		enabled: bool,
		hidden: bool,
		selectedCurve: oneOf(['rgb', 'r', 'g', 'b']),
		rgb: arrayOf(pointPropType),
		r: arrayOf(pointPropType),
		g: arrayOf(pointPropType),
		b: arrayOf(pointPropType)
	}).isRequired,
	eyedropper: exact({
		active: oneOf([false, 'white', 'black']),
		pixelData: oneOf([false, exact({
			r: string,
			g: string,
			b: string
		})])
	}).isRequired,
	setEyedropper: func.isRequired,
	editAll: bool,
	dispatch: func.isRequired
}

export default ColorCorrection
