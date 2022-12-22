import React, { useEffect, useRef } from 'react'
import { bool, func, number, object, oneOf, oneOfType, string } from 'prop-types'

import { createScrollbarPadder, objectExtract } from 'utilities'

import FileOptions from './FileOptions'
import Audio from './Audio'
import Formatting from './Formatting'
import Source from './Source'
import Centering from './Centering'
import Position from './Position'
import Scale from './Scale'
import Crop from './Crop'
import Rotation from './Rotation'
import Keying from './Keying'

const scrollbarPadder = createScrollbarPadder()

const extractCommonProps = (() => {
	const common = ['id', 'mediaType', 'editAll', 'isBatch', 'width', 'height', 'aspectRatio', 'dispatch', 'arc']

	return obj => objectExtract(obj, common)
})()

const EditorOptions = props => {
	if (!props.id) return false

	const common = extractCommonProps(props)
	const { mediaType, aspectRatio, arc } = common

	const ref = useRef()

	useEffect(() => {
		scrollbarPadder.observe(ref.current, 6)

		return () => {
			scrollbarPadder.disconnect()
		}
	}, [])

	return (
		<div ref={ref} id="editor-options">
			<FileOptions
				batch={props.batch}
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
					audio={props.audio}
					{...common} />
			) : <></>}
			{mediaType !== 'audio' && !(mediaType === 'video' && props.audio.exportAs === 'audio') ? <>
				<Formatting 
					arc={arc}
					background={props.background}
					backgroundMotion={props.backgroundMotion}
					bgColor={props.bgColor}
					overlay={props.overlay}
					backgroundDisabled={props.backgroundDisabled}
					{...common} />
				{!(arc === 'none' && aspectRatio !== '16:9') ? (
					<Source
						source={props.source}
						{...common} />
				) : <></>}
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
						scale={props.scale}
						crop={props.crop}
						{...common} />
					<Crop
						crop={props.crop}
						{...common} />
				</> : <></>}
				<Rotation
					rotation={props.rotation}
					scale={props.scale}
					crop={props.crop}
					arc={arc}
					{...common} />
				{arc === 'fit' || arc === 'transform' ? (
					<Keying
						keying={props.keying}
						{...common} />
				) : <></>}
			</> : <></>}
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
	batch: object,
	filename: string,
	start: number,
	end: number,
	fps: number,
	totalFrames: number,
	duration: number,
	split: number,
	audio: object,
	arc: string,
	background: string,
	backgroundMotion: string,
	bgColor: string,
	overlay: string,
	backgroundDisabled: bool.isRequired,
	source: object,
	centering: oneOfType([oneOf(['']), number]),
	position: object,
	scale: object,
	crop: object,
	rotation: object,
	dispatch: func.isRequired
}

export default EditorOptions
