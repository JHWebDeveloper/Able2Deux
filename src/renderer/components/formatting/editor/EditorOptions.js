import React, { useCallback } from 'react'
import { arrayOf, bool, func, number, object, oneOf, oneOfType, string } from 'prop-types'

import {
	toggleMediaCheckbox,
	updateMediaStateById,
	updateMediaStateBySelection
} from 'actions'

import { MEDIA_TYPES } from 'constants'

import FileOptions from './FileOptions'
import PresetNameTemplate from './PresetNameTemplate'
import Audio from './Audio'
import Framing from './Framing'
import Source from './Source'
import Centering from './Centering'
import Position from './Position'
import Scale from './Scale'
import Crop from './Crop'
import Rotation from './Rotation'
import Keying from './Keying'
import ColorCorrection from './ColorCorrection'

const EditorOptions = props => {
	const { id } = props

	if (!id) return <></>

	const { multipleItems, multipleItemsSelected, background, mediaType, aspectRatio, arc, audioVideoTracks, eyedropper, setEyedropper, dispatch } = props

	const updateMediaFromEvent = useCallback(e => {
		const { name, value } = e?.target || e

		dispatch(updateMediaStateById(id, {
			[name]: value
		}))
	}, [id])

	const updateSelectionFromEvent = useCallback(e => {
		const { name, value } = e?.target || e
		
		dispatch(updateMediaStateBySelection({
			[name]: value
		}))
	}, [])

	const toggleSelectionCheckbox = useCallback(e => {
		dispatch(toggleMediaCheckbox(id, e))
	}, [id])

	const commonProps = {
		id,
		multipleItems,
		multipleItemsSelected,
		updateSelectionFromEvent,
		dispatch
	}

	return (
		<div id="editor-options">
			<FileOptions
				filename={props.filename}
				start={props.start}
				end={props.end}
				fps={props.fps}
				totalFrames={props.totalFrames}
				duration={props.duration}
				split={props.split}
				mediaType={mediaType}
				updateFilename={updateMediaFromEvent}
				{...commonProps} />
			{props.hasAudio ? (
				<Audio
					audioVideoTracks={audioVideoTracks}
					audioExportFormat={props.audioExportFormat}
					mediaType={mediaType}
					{...commonProps} />
			) : <></>}
			{mediaType === 'audio' || mediaType === 'video' && audioVideoTracks === 'audio' ? <></> : <>
				<Framing
					arc={arc}
					background={background}
					backgroundMotion={props.backgroundMotion}
					bgColor={props.bgColor}
					overlay={props.overlay}
					mediaType={mediaType}
					eyedropper={eyedropper}
					setEyedropper={setEyedropper}
					{...commonProps} />
				{arc === 'none' && aspectRatio !== '16:9' ? <></> : (
					<Source
						sourceName={props.sourceName}
						sourcePrefix={props.sourcePrefix}
						sourceOnTop={props.sourceOnTop}
						background={background}
						toggleSelectionCheckbox={toggleSelectionCheckbox}
						{...commonProps} />
				)}
				{arc === 'fill' && aspectRatio !== '16:9' ? (
					<Centering
						centering={props.centering}
						{...commonProps} />
				) : <></>}
				{arc === 'transform' ? <>
					<Position
						positionX={props.positionX}
						positionY={props.positionY}
						{...commonProps} />
					<Scale
						scaleX={props.scaleX}
						scaleY={props.scaleY}
						scaleLink={props.scaleLink}
						toggleSelectionCheckbox={toggleSelectionCheckbox}
						{...commonProps} />
					<Crop
						cropT={props.cropT}
						cropR={props.cropR}
						cropB={props.cropB}
						cropL={props.cropL}
						cropLinkTB={props.cropLinkTB}
						cropLinkLR={props.cropLinkLR}
						toggleSelectionCheckbox={toggleSelectionCheckbox}
						{...commonProps} />
				</> : <></>}
				<Rotation
					transpose={props.transpose}
					reflect={props.reflect}
					freeRotateMode={props.freeRotateMode}
					angle={props.angle}
					rotatedCentering={props.rotatedCentering}
					showFreeRotate={arc === 'transform'}
					{...commonProps} />
				{arc === 'none' ? <></> : (
					<Keying
						keyingEnabled={props.keyingEnabled}
						keyingHidden={props.keyingHidden}
						keyingType={props.keyingType}
						keyingColor={props.keyingColor}
						keyingSimilarity={props.keyingSimilarity}
						keyingBlend={props.keyingBlend}
						keyingThreshold={props.keyingThreshold}
						keyingTolerance={props.keyingTolerance}
						keyingSoftness={props.keyingSoftness}
						eyedropper={eyedropper}
						setEyedropper={setEyedropper}
						toggleSelectionCheckbox={toggleSelectionCheckbox}
						{...commonProps} />
				)}
				<ColorCorrection
					ccEnabled={props.ccEnabled}
					ccHidden={props.ccHidden}
					ccSelectedCurve={props.ccSelectedCurve}
					ccRGB={props.ccRGB}
					ccR={props.ccR}
					ccG={props.ccG}
					ccB={props.ccB}
					eyedropper={eyedropper}
					setEyedropper={setEyedropper}
					selectCurve={updateMediaFromEvent}
					toggleSelectionCheckbox={toggleSelectionCheckbox}
					{...commonProps} />
				<PresetNameTemplate
					presetNamePrepend={props.presetNamePrepend}
					presetNameAppend={props.presetNameAppend}
					{...commonProps} />
			</>}
		</div>
	)
}

EditorOptions.propTypes = {
	id: string,
	multipleItems: bool,
	multipleItemsSelected: bool,
	mediaType: oneOf(MEDIA_TYPES),
	hasAudio: bool,
	width: number,
	height: number,
	aspectRatio: string,
	hasAlpha: bool,
	filename: string,
	start: number,
	end: number,
	fps: number,
	totalFrames: number,
	duration: number,
	split: number,
	audioVideoTracks: oneOf(['video_audio', 'video', 'audio']),
	audioExportFormat: oneOf(['wav', 'mp3', 'bars']),
	arc: oneOf(['none', 'fit', 'fill', 'transform']),
	background: oneOf(['blue', 'grey', 'light_blue', 'dark_blue', 'teal', 'tan', 'alpha', 'color']),
	backgroundMotion: oneOf(['animated', 'still', 'auto']),
	bgColor: string,
	overlay: oneOf(['none', 'tv', 'laptop']),
	sourceName: string,
	sourcePrefix: bool,
	sourceOnTop: bool,
	centering: oneOfType([oneOf(['']), number]),
	positionX: oneOfType([oneOf(['']), number]),
	positionY: oneOfType([oneOf(['']), number]),
	scaleX: oneOfType([oneOf(['']), number]),
	scaleY: oneOfType([oneOf(['']), number]),
	scaleLink: bool,
	cropT: oneOfType([oneOf(['']), number]),
	cropR: oneOfType([oneOf(['']), number]),
	cropB: oneOfType([oneOf(['']), number]),
	cropL: oneOfType([oneOf(['']), number]),
	cropLinkTB: bool,
	cropLinkLR: bool,
	transpose: oneOf(['', 'transpose=1', 'transpose=2,transpose=2', 'transpose=2']),
	reflect: oneOf(['', 'hflip', 'vflip', 'hflip,vflip']),
	freeRotateMode: oneOf(['inside_bounds', 'with_bounds']),
	angle: number,
	rotatedCentering: number,
	keyingBlend: number,
	keyingColor: string,
	keyingEnabled: bool,
	keyingHidden: bool,
	keyingSimilarity: number,
	keyingSoftness: number,
	keyingThreshold: number,
	keyingTolerance: number,
	keyingType: oneOf(['colorkey', 'chromakey', 'lumakey']),
	ccEnabled: bool,
	ccHidden: bool,
	ccSelectedCurve: oneOf(['ccRGB', 'ccR', 'ccG', 'ccB']),
	ccRGB: arrayOf(object),
	ccR: arrayOf(object),
	ccG: arrayOf(object),
	ccB: arrayOf(object),
	presetNamePrepend: string,
	presetNameAppend: string,
	eyedropper: object.isRequired,
	setEyedropper: func.isRequired,
	dispatch: func.isRequired
}

export default EditorOptions
