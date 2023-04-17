import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { arrayOf, bool, exact, func, number, oneOf, oneOfType, string } from 'prop-types'

import {
	addCurvePoint,
	addOrUpdateCurvePoint,
	applySettingsToAll,
	cleanupCurve,
	colorBalance,
	copySettings,
	deleteCurvePoint,
	resetCurve,
	toggleMediaNestedCheckbox,
	updateMediaNestedStateFromEvent
} from 'actions'

import { createColorCurvesCopier, createSettingsMenu, pipe } from 'utilities'

import AccordionPanel from '../../form_elements/AccordionPanel'
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
	title: 'White Point',
	alignment: 'center'
}

const propsBlackPtStatic = {
	name: 'blackPt',
	title: 'Black Point',
	alignment: 'center'
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

const ColorCorrection = ({ id, colorCurves, eyedropper, setEyedropper, editAll, dispatch }) => {
	const { enabled, selectedCurve, rgb, r, g, b } = colorCurves
	const { active, pixelData } = eyedropper
	const curvesRef = useRef(null)

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
		setEyedropper(({ active }) => ({
			active: active === 'white' ? false : 'white',
			pixelData: false
		}))
	}, [])

	const selectBlackPt = useCallback(() => {
		setEyedropper(({ active }) => ({
			active: active === 'black' ? false : 'black',
			pixelData: false
		}))
	}, [])

	useEffect(() => {
		if ((active === 'black' || active === 'white') && pixelData) {
			dispatch(colorBalance(id, eyedropper, { r, g, b }, editAll))
			setEyedropper({ active: false, pixelData: false })
		}
	}, [id, eyedropper, r, g, b, editAll])

	return (
		<>
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
					aria-label="Select Black Point"
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
					aria-label="Select White Point"
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
					aria-label="Reset Curves"
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
				ref={curvesRef}
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
					onChange: setBlackPoint,
					onClick() {
						curvesRef.current?.setSelectedPoint(blackPt)
					}
				}}
				rightThumb={{
					...propsWhitePtStatic,
					value: whitePt.x,
					min: colorCurves[selectedCurve].at(-2).x + 6,
					onChange: setWhitePoint,
					onClick() {
						curvesRef.current?.setSelectedPoint(whitePt)
					}
				}}
				min={0}
				max={256}
				fineTuneStep={1}
				hasMiddleThumb={false}
				disabled={!enabled} />
		</>
	)
}

const ColorCorrectionPanel = props => {
	const { isBatch, colorCurves, id, dispatch } = props

	const settingsMenu = useMemo(() => createSettingsMenu(isBatch, [
		() => pipe({ colorCurves })(createColorCurvesCopier, copySettings, dispatch),
		() => pipe({ colorCurves })(createColorCurvesCopier, applySettingsToAll(id), dispatch)
	]), [isBatch, id, colorCurves])

	return ( 
		<AccordionPanel
			heading="Color Correction"
			id="color-correction"
			className="editor-options"
			buttons={settingsMenu}>
			<ColorCorrection {...props} />
		</AccordionPanel>
	)
}

const pointPropType = exact({
	id: string,
	hidden: bool,
	limit: bool,
	x: number,
	y: number
})

const propTypes = {
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

ColorCorrection.propTypes = propTypes
ColorCorrectionPanel.propTypes = propTypes

export default ColorCorrectionPanel
