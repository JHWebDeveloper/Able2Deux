import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { arrayOf, bool, exact, number, oneOfType, string } from 'prop-types'

const createThirdMarkerCoords = (x, y, r) => [
	[x - r, y, x + r, y],
	[x, y - r, x, y + r]
]

const Grid = ({ showGrid, gridColor, aspectRatioMarkers, previewSize }) => {
	const cnv = useRef()
	const ctx = useRef()

	const drawGridMarkers = useCallback(coords => {
		let i = coords.length
	
		ctx.current.beginPath()
	
		while (i--) {
			const [ x1, y1, x2, y2 ] = coords[i]
	
			ctx.current.moveTo(x1, y1)
			ctx.current.lineTo(x2, y2)
		}
	
		ctx.current.stroke()
	}, [ctx.current])

	const drawAspectRatioMarkers = useMemo(() => {
		const { frameWidth, frameHeight } = previewSize

		const frameRatio = frameWidth / frameHeight
		const frameRatioInv = frameHeight / frameWidth

		return (antecedent, consequent) => {
			const markerRatio = antecedent / consequent
			const coords = [[0, 0, 0, 0], [0, 0, 0, 0]]
		
			if (markerRatio < frameRatio) {
				const markerGap = markerRatio * frameRatioInv * frameWidth
				const markerPad = (frameWidth - markerGap) / 2
		
				coords[0][0] = coords[0][2] = markerPad
				coords[0][3] = coords[1][3] = frameHeight
				coords[1][0] = coords[1][2] = markerGap + markerPad
			} else {
				const markerGap = consequent / antecedent * frameRatio * frameHeight
				const markerPad = (frameHeight - markerGap) / 2
		
				coords[0][1] = coords[0][3] = markerPad
				coords[0][2] = coords[1][2] = frameWidth
				coords[1][1] = coords[1][3] = markerGap + markerPad
			}
		
			drawGridMarkers(coords)
		}
	}, [previewSize])

	const drawGrid = useMemo(() => {
		const { frameWidth, frameHeight } = previewSize

		const titleSafePadX = frameWidth / 20
		const titleSafePadY = frameHeight / 20
		const actionSafe = [titleSafePadX / 2, titleSafePadY / 2, frameWidth - titleSafePadX, frameHeight - titleSafePadY]
		const titleSafe = [titleSafePadX, titleSafePadY, frameWidth - titleSafePadX * 2, frameHeight - titleSafePadY * 2]

		const halfX = frameWidth / 2
		const halfY = frameHeight / 2
		const thirdX = frameWidth / 3
		const thirdY = frameHeight / 3
		const thirdRadius = frameWidth / 48

		const halvesAndThirds = [
			[0, halfY, frameWidth, halfY],
			[halfX, 0, halfX, frameHeight],
			...createThirdMarkerCoords(thirdX, thirdY, thirdRadius),
			...createThirdMarkerCoords(thirdX * 2, thirdY, thirdRadius),
			...createThirdMarkerCoords(thirdX, thirdY * 2, thirdRadius),
			...createThirdMarkerCoords(thirdX * 2, thirdY * 2, thirdRadius)
		]

		return () => {
			ctx.current.strokeRect(...actionSafe)
			ctx.current.strokeRect(...titleSafe)

			drawGridMarkers(halvesAndThirds)
		}
	}, [previewSize])

	useEffect(() => {
		ctx.current = cnv.current.getContext('2d')
	}, [])
	
	useEffect(() => {
		cnv.current.width = previewSize.frameWidth
		cnv.current.height = previewSize.frameHeight
		ctx.current.lineWidth = 1.25
	}, [previewSize])

	useEffect(() => {
		ctx.current.clearRect(0, 0, previewSize.frameWidth, previewSize.frameHeight)
		ctx.current.strokeStyle = gridColor
		
		if (showGrid) drawGrid()

		for (const { disabled, selected, ratio } of aspectRatioMarkers) {
			if (!disabled && selected) drawAspectRatioMarkers(...ratio)
		}
	}, [showGrid, gridColor, aspectRatioMarkers, previewSize])

	return <canvas ref={cnv}></canvas>
}

Grid.propTypes = {
	showGrid: bool.isRequired,
	previewSize: oneOfType([bool, exact({
		width: number,
		height: number
	})]),
	aspectRatioMarkers: arrayOf(exact({
		id: string,
		label: string,
		disabled: bool,
		selected: bool,
		ratio: arrayOf(number)
	})).isRequired,
	gridColor: string.isRequired
}

export default Grid
