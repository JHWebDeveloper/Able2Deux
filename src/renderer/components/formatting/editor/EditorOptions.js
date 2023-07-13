import React from 'react'
import { arrayOf, bool, func, number, object, oneOf, oneOfType, string } from 'prop-types'

import {
	extractCommonProps,
	extractCropProps,
	extractScaleProps
} from 'utilities'

import FileOptions from './FileOptions'
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
	if (!props.id) return <></>

	const { background, mediaType, aspectRatio, arc, audioVideoTracks, eyedropper, setEyedropper } = props
	const common = extractCommonProps(props)
	const scale = extractScaleProps(props)
	const crop = extractCropProps(props)

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
				{...common} />
			{props.hasAudio ? (
				<Audio
					audioVideoTracks={audioVideoTracks}
					audioExportFormat={props.audioExportFormat}
					{...common} />
			) : <></>}
			{mediaType === 'audio' || mediaType === 'video' && audioVideoTracks === 'audio' ? <></> : <>
				<Framing 
					arc={arc}
					background={background}
					backgroundMotion={props.backgroundMotion}
					bgColor={props.bgColor}
					overlay={props.overlay}
					eyedropper={eyedropper}
					setEyedropper={setEyedropper}
					{...common} />
				{arc === 'none' && aspectRatio !== '16:9' ? <></> : (
					<Source
						sourceName={props.sourceName}
						sourcePrefix={props.sourcePrefix}
						sourceOnTop={props.sourceOnTop}
						background={background}
						{...common} />
				)}
				{arc === 'fill' && aspectRatio !== '16:9' ? (
					<Centering
						centering={props.centering}
						{...common} />
				) : <></>}
				{arc === 'transform' ? <>
					<Position
						positionX={props.positionX}
						positionY={props.positionY}
						{...common} />
					<Scale
						freeRotateMode={props.freeRotateMode}
						angle={props.angle}
						{...scale}
						{...crop}
						{...common} />
					<Crop
						{...crop}
						{...common} />
				</> : <></>}
				<Rotation
					transpose={props.transpose}
					reflect={props.reflect}
					freeRotateMode={props.freeRotateMode}
					angle={props.angle}
					rotatedCentering={props.rotatedCentering}
					showFreeRotate={arc === 'transform'}
					{...scale}
					{...crop}
					{...common} />
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
						{...common} />
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
					{...common} />
			</>}
		</div>
	)
}

EditorOptions.propTypes = {
	id: string,
	multipleItems: bool,
	mediaType: oneOf(['video', 'image', 'gif', 'audio']),
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
	eyedropper: object.isRequired,
	setEyedropper: func.isRequired,
	dispatch: func.isRequired
}

export default EditorOptions
