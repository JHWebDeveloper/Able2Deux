import React, { memo, useCallback, useEffect, useMemo, useRef } from 'react'
import { arrayOf, bool, exact, func, number, oneOf, oneOfType, string } from 'prop-types'

import {
	addCurvePoint,
	addOrUpdateCurvePoint,
	applyToAll,
	applyToSelection,
	cleanupCurve,
	colorBalance,
	copyAttributes,
	deleteCurvePoint,
	resetCurve,
	saveAsPreset
} from 'actions'

import {
	classNameBuilder,
	createObjectPicker,
	createSettingsMenu,
	eraseIds,
	objectsAreEqual,
	omitFromHistory,
	pipe
} from 'utilities'

import AccordionPanel from '../../form_elements/AccordionPanel'
import Checkbox from '../../form_elements/Checkbox'
import EyedropperIcon from '../../svg/EyedropperIcon'
import RadioSet from '../../form_elements/RadioSet'
import Curves from '../../form_elements/Curves'
import SliderDouble from '../../form_elements/SliderDouble'

const COLOR_CHANNEL_OPTIONS = Object.freeze([
	{
		label: 'RGB',
		value: 'ccRGB'
	},
	{
		label: 'R',
		value: 'ccR'
	},
	{
		label: 'G',
		value: 'ccG'
	},
	{
		label: 'B',
		value: 'ccB'
	}
])

const WHITE_PT_STATIC_PROPS = Object.freeze({
	name: 'whitePt',
	title: 'White Point',
	alignment: 'center'
})

const BLACK_PT_STATIC_PROPS = Object.freeze({
	name: 'blackPt',
	title: 'Black Point',
	alignment: 'center'
})

const getCurveColor = curveName => {
	switch (curveName) {
		case 'ccR':
			return '#f00'
		case 'ccG':
			return '#008000'
		case 'ccB':
			return '#00f'
		default:
			return '#000'
	}
}

const extractColorCorrectionProps = createObjectPicker(['ccEnabled', 'ccRGB', 'ccR', 'ccG', 'ccB'])

const ColorCorrection = memo(props => {
	const { id, ccEnabled, ccSelectedCurve, ccRGB, ccR, ccG, ccB, eyedropper, setEyedropper, toggleSelectionCheckbox, dispatch } = props
	const { active, pixelData } = eyedropper
	const curvesRef = useRef(null)

	const toggleColorCorrection = useCallback(e => {
		if (active === 'black' || active === 'white') {
			setEyedropper({ active: false, pixelData: false })
		}

		toggleSelectionCheckbox(e)
	}, [id, active])

	// ---- Curves ----

	const curveName = ccSelectedCurve
	
	const dispatchAddCurvePoint = useCallback(pointData => {
		pipe(addCurvePoint, omitFromHistory, dispatch)({ id, curveName, pointData })
	}, [id, ccSelectedCurve])
	
	const dispatchAddOrUpdateCurvePoint = useCallback(pointData => {
		pipe(addOrUpdateCurvePoint, omitFromHistory, dispatch)({ id, curveName, pointData })
	}, [id, ccSelectedCurve])

	const dispatchDeleteCurvePoint = useCallback(pointId => {
		dispatch(deleteCurvePoint({ id, curveName, pointId }))
	}, [id, ccSelectedCurve])
	
	const dispatchCleanupCurve = useCallback(() => {
		dispatch(cleanupCurve(ccSelectedCurve))
	}, [ccSelectedCurve])

	const dispatchResetCurve = useCallback(e => {
		dispatch(resetCurve(e.shiftKey && ccSelectedCurve))
	}, [ccSelectedCurve])

	// ---- Curves Channels ----

	const curveColor = useMemo(() => getCurveColor(ccSelectedCurve), [ccSelectedCurve])

	// eslint-disable-next-line no-extra-parens
	const channelCurves = useMemo(() => ccSelectedCurve === 'ccRGB' ? (
		['ccB', 'ccG', 'ccR'].reduce((acc, ch) => {
			const chCurve = props[ch]

			if (chCurve.length > 2 || chCurve[0].x > 0 || chCurve[0].y < 256 || chCurve[1].x < 256 || chCurve[1].y > 0) {
				acc.push({
					color: getCurveColor(ch),
					data: chCurve
				})
			}
				
			return acc
		}, [])
	) : [], [ccSelectedCurve, ccR, ccG, ccB])

	// ---- White Balance Slider ----

	const blackPt = useMemo(() => props[ccSelectedCurve][0], [ccSelectedCurve, ccRGB, ccR, ccG, ccB])
	const whitePt = useMemo(() => props[ccSelectedCurve].at(-1), [ccSelectedCurve, ccRGB, ccR, ccG, ccB])

	const setBlackPoint = useCallback(({ value }) => {
		dispatch(addOrUpdateCurvePoint({
			id,
			curveName: ccSelectedCurve,
			pointData: {
				...blackPt,
				x: value
			}
		}))
	}, [id, ccSelectedCurve, blackPt])

	const setWhitePoint = useCallback(({ value }) => {
		dispatch(addOrUpdateCurvePoint({
			id,
			curveName: ccSelectedCurve,
			pointData: {
				...whitePt,
				x: value
			}
		}))
	}, [id, ccSelectedCurve, whitePt])

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
			dispatch(colorBalance(eyedropper, { ccR, ccG, ccB }))
			setEyedropper({ active: false, pixelData: false })
		}
	}, [eyedropper, ccR, ccG, ccB])

	return (
		<>
			<div>
				<div className="on-off-switch">
					<Checkbox
						name="ccEnabled"
						checked={ccEnabled}
						onChange={toggleColorCorrection}
						switchIcon />
				</div>
				<button
					type="button"
					title="Select Black Point"
					aria-label="Select Black Point"
					className={classNameBuilder({
						'eyedropper-btn': true,
						'eyedropper-active': active === 'black'
					})}
					onClick={selectBlackPt}
					disabled={!ccEnabled}>
					<EyedropperIcon
						contentColor="#000"
						hideContents={!ccEnabled} />
				</button>
				<button
					type="button"
					title="Select White Point"
					aria-label="Select White Point"
					className={classNameBuilder({
						'eyedropper-btn': true,
						'eyedropper-active': active === 'white'
					})}
					onClick={selectWhitePt}
					disabled={!ccEnabled}>
					<EyedropperIcon
						contentColor="#fff"
						hideContents={!ccEnabled} />
				</button>
				<Checkbox
					name="ccHidden"
					checked={props.ccHidden}
					onChange={toggleSelectionCheckbox}
					disabled={!ccEnabled}
					visibleIcon />
				<button
					type="button"
					title="Reset Curves"
					aria-label="Reset Curves"
					className="symbol"
					onClick={dispatchResetCurve}
					disabled={!ccEnabled}>format_color_reset</button>
			</div>
			<RadioSet
				label="Color Channel"
				name="ccSelectedCurve"
				className="bold-labels"
				hideLabel
				horizontal
				disabled={!ccEnabled}
				state={ccSelectedCurve}
				options={COLOR_CHANNEL_OPTIONS}
				onChange={props.selectCurve} />
			<Curves
				ref={curvesRef}
				curve={props[ccSelectedCurve]}
				selectedCurve={ccSelectedCurve}
				curveColor={curveColor}
				backgroundCurves={channelCurves}
				addCurvePoint={dispatchAddCurvePoint}
				addOrUpdateCurvePoint={dispatchAddOrUpdateCurvePoint}
				deleteCurvePoint={dispatchDeleteCurvePoint}
				cleanupCurve={dispatchCleanupCurve}
				disabled={!ccEnabled} />
			<SliderDouble
				leftThumb={{
					...BLACK_PT_STATIC_PROPS,
					value: blackPt.x,
					max: props[ccSelectedCurve][1].x - 6,
					onChange: setBlackPoint,
					onClick() {
						curvesRef.current?.setSelectedPoint(blackPt)
					}
				}}
				rightThumb={{
					...WHITE_PT_STATIC_PROPS,
					value: whitePt.x,
					min: props[ccSelectedCurve].at(-2).x + 6,
					onChange: setWhitePoint,
					onClick() {
						curvesRef.current?.setSelectedPoint(whitePt)
					}
				}}
				min={0}
				max={256}
				microStep={1}
				hasMiddleThumb={false}
				disabled={!ccEnabled} />
		</>
	)
}, objectsAreEqual)

const ColorCorrectionPanel = props => {
	const { id, multipleItems, multipleItemsSelected, dispatch } = props

	// eslint-disable-next-line no-extra-parens
	const settingsMenu = useMemo(() => (
		createSettingsMenu(multipleItems, multipleItemsSelected, [
			() => dispatch(copyAttributes(id, extractColorCorrectionProps, eraseIds)),
			() => dispatch(applyToSelection(id, extractColorCorrectionProps)),
			() => dispatch(applyToAll(id, extractColorCorrectionProps)),
			() => dispatch(saveAsPreset(id, extractColorCorrectionProps, eraseIds))
		])
	), [multipleItems, multipleItemsSelected, id])

	return ( 
		<AccordionPanel
			heading="Color Correction"
			id="colorCorrection"
			className="editor-options"
			options={settingsMenu}>
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
	ccEnabled: bool.isRequired,
	ccHidden: bool.isRequired,
	ccSelectedCurve: oneOf(['ccRGB', 'ccR', 'ccG', 'ccB']).isRequired,
	ccRGB: arrayOf(pointPropType).isRequired,
	ccR: arrayOf(pointPropType).isRequired,
	ccG: arrayOf(pointPropType).isRequired,
	ccB: arrayOf(pointPropType).isRequired,
	eyedropper: exact({
		active: oneOf([false, 'white', 'black', 'key', 'background']),
		pixelData: oneOfType([bool, exact({
			r: string,
			g: string,
			b: string
		})])
	}).isRequired,
	setEyedropper: func.isRequired,
	multipleItems: bool.isRequired,
	multipleItemsSelected: bool.isRequired,
	toggleSelectionCheckbox: func.isRequired,
	selectCurve: func.isRequired,
	dispatch: func.isRequired
}

ColorCorrection.propTypes = propTypes
ColorCorrectionPanel.propTypes = propTypes

export default ColorCorrectionPanel
