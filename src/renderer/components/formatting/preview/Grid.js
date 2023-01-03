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
		const frameWidth = previewSize.width
		const frameHeight = previewSize.height
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
		const { width, height } = previewSize

		const titleSafePadX = width / 20
		const titleSafePadY = height / 20
		const actionSafe = [titleSafePadX / 2, titleSafePadY / 2, width - titleSafePadX, height - titleSafePadY]
		const titleSafe = [titleSafePadX, titleSafePadY, width - titleSafePadX * 2, height - titleSafePadY * 2]

		const halfX = width / 2
		const halfY = height / 2
		const thirdX = width / 3
		const thirdY = height / 3
		const thirdRadius = width / 48

		const halvesAndThirds = [
			[0, halfY, width, halfY],
			[halfX, 0, halfX, height],
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
		cnv.current.width = previewSize.width
		cnv.current.height = previewSize.height
		ctx.current.lineWidth = 3
	}, [previewSize])

	useEffect(() => {
		ctx.current.clearRect(0, 0, previewSize.width, previewSize.height)
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
