import React, { useEffect, useRef } from 'react'
import { bool, func, number, object, oneOf, string } from 'prop-types'

import { createScrollbarPadder } from 'utilities'

import FileOptions from './FileOptions'
import Formatting from './Formatting'
import Source from './Source'
import Centering from './Centering'
import Position from './Position'
import Scale from './Scale'
import Crop from './Crop'
import Rotation from './Rotation'
import Audio from './Audio'

const scrollbarPadder = createScrollbarPadder()

const EditorOptions = props => {
	const { id, mediaType, editAll, isBatch, width, height, aspectRatio, dispatch, arc } = props
	const common = { id, mediaType, editAll, isBatch, width, height, aspectRatio, dispatch }

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
				duration={props.duration}
				{...common} />
			{(mediaType === 'video' || mediaType === 'audio') && (
				<Audio
					audio={props.audio}
					{...common} />
			)}
			{mediaType !== 'audio' && !(mediaType === 'video' && props.audio.exportAs === 'audio') && <>
				<Formatting
					hasAlpha={props.hasAlpha}
					arc={arc}
					background={props.background}
					overlay={props.overlay}
					{...common} />
				{!(arc === 'none' && aspectRatio !== '16:9') && (
					<Source
						source={props.source}
						{...common} />
				)}
				{arc === 'fill' && aspectRatio !== '16:9' && (
					<Centering
						centering={props.centering}
						{...common} />
				)}
				{arc === 'transform' && <>
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
				</>}
				<Rotation
					rotation={props.rotation}
					scale={props.scale}
					crop={props.crop}
					{...common} />
			</>}
		</div>
	)
}

EditorOptions.propTypes = {
	id: string.isRequired,
	isBatch: bool.isRequired,
	editAll: bool.isRequired,
	mediaType: oneOf(['video', 'image', 'gif', 'audio']),
	width: number.isRequired,
	height: number.isRequired,
	duration: number.isRequired,
	aspectRatio: string,
	hasAlpha: bool.isRequired,
	batch: object.isRequired,
	filename: string,
	start: object,
	end: object,
	audio: object.isRequired,
	arc: string.isRequired,
	background: string.isRequired,
	overlay: string.isRequired,
	source: object.isRequired,
	centering: number.isRequired,
	position: object.isRequired,
	scale: object.isRequired,
	crop: object.isRequired,
	rotation: object.isRequired,
	dispatch: func.isRequired
}

export default EditorOptions
