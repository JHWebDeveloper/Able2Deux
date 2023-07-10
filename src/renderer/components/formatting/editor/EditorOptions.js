import React from 'react'
import { bool, func, number, object, oneOf, oneOfType, string } from 'prop-types'

import { objectPick } from 'utilities'

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

const extractCommonProps = (() => {
	const common = ['id', 'mediaType', 'editAll', 'isBatch', 'width', 'height', 'aspectRatio', 'dispatch']

	return obj => objectPick(obj, common)
})()

const EditorOptions = props => {
	if (!props.id) return <></>

	const { background, mediaType, aspectRatio, arc, audioVideoTracks, scale, crop, eyedropper, setEyedropper } = props
	const common = extractCommonProps(props)

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
						position={props.position}
						{...common} />
					<Scale
						scale={scale}
						crop={crop}
						rotation={props.rotation}
						{...common} />
					<Crop
						crop={crop}
						{...common} />
				</> : <></>}
				<Rotation
					rotation={props.rotation}
					scale={scale}
					crop={crop}
					showFreeRotate={arc === 'transform'}
					{...common} />
				{arc === 'none' ? <></> : (
					<Keying
						keying={props.keying}
						eyedropper={eyedropper}
						setEyedropper={setEyedropper}
						{...common} />
				)}
				<ColorCorrection
					colorCurves={props.colorCurves}
					eyedropper={eyedropper}
					setEyedropper={setEyedropper}
					{...common} />
			</>}
		</div>
	)
}

EditorOptions.propTypes = {
	id: string,
	isBatch: bool,
	editAll: bool,
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
	arc: string,
	background: string,
	backgroundMotion: string,
	bgColor: string,
	overlay: string,
	sourceName: string,
	sourcePrefix: bool,
	sourceOnTop: bool,
	centering: oneOfType([oneOf(['']), number]),
	position: object,
	scale: object,
	crop: object,
	rotation: object,
	keying: object,
	colorCurves: object,
	eyedropper: object.isRequired,
	setEyedropper: func.isRequired,
	dispatch: func.isRequired
}

export default EditorOptions
