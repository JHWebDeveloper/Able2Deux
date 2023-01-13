import React, { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { arrayOf, bool, exact, func, number, oneOf, oneOfType, string } from 'prop-types'

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

import { compareProps, copyCurveSet, createSettingsMenu } from 'utilities'

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

const ColorCorrection = memo(({ id, colorCurves, eyedropper, setEyedropper, isBatch, editAll, dispatch }) => {
	const [ selectedPoint, setSelectedPoint ] = useState({})
	const { enabled, selectedCurve, rgb, r, g, b } = colorCurves
	const { active, pixelData } = eyedropper

	const toggleCCCheckbox = useCallback(e => {
		dispatch(toggleMediaNestedCheckbox(id, 'colorCurves', e, editAll))
	}, [id, editAll])

	const toggleColorCorrection = useCallback(e => {
		if (active === 'black' || active === 'white') {
			setEyedropper({ active: false, pixelData: false })
		}

		toggleCCCheckbox(e)
	}, [id, editAll, active])

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

			if (chCurve.length > 2 || chCurve[0].x > 0 || chCurve[0].y < 256 || chCurve[1].x < 256 || chCurve[1].y > 0) {
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
		setEyedropper({
			active: active === 'white' ? false : 'white',
			pixelData: false
		})
	}, [active])

	const selectBlackPt = useCallback(() => {
		setEyedropper({
			active: active === 'black' ? false : 'black',
			pixelData: false
		})
	}, [active])

	useEffect(() => {
		if ((active === 'black' || active === 'white') && pixelData) {
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
					className={`eyedropper-btn${active === 'black' ? ' eyedropper-active' : ''}`}
					onClick={selectBlackPt}
					disabled={!enabled}>
					<EyedropperIcon
						contentColor="#000"
						hideContents={!enabled} />
				</button>
				<button
					type="button"
					title="Select White Point"
					className={`eyedropper-btn${active === 'white' ? ' eyedropper-active' : ''}`}
					onClick={selectWhitePt}
					disabled={!enabled}>
					<EyedropperIcon
						contentColor="#fff"
						hideContents={!enabled} />
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
				selectedPoint={selectedPoint}
				curveColor={curveColor}
				backgroundCurves={channelCurves}
				setSelectedPoint={setSelectedPoint}
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
					onChange: setBlackPoint,
					onClick() {
						setSelectedPoint(blackPt)
					}
				}}
				rightThumb={{
					...propsWhitePtStatic,
					value: whitePt.x,
					min: colorCurves[selectedCurve].at(-2).x + 6,
					onChange: setWhitePoint,
					onClick() {
						setSelectedPoint(whitePt)
					}
				}}
				min={0}
				max={256}
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
		active: oneOf([false, 'white', 'black', 'key', 'background']),
		pixelData: oneOfType([bool, exact({
			r: string,
			g: string,
			b: string
		})])
	}).isRequired,
	setEyedropper: func.isRequired,
	isBatch: bool.isRequired,
	editAll: bool.isRequired,
	dispatch: func.isRequired
}

export default ColorCorrection
