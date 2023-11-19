import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { exact, func, number, oneOf, oneOfType, shape, string } from 'prop-types'

const PreviewCanvas = ({ previewStill, previewSize, eyedropper, setEyedropper }) => {
	const cnv = useRef(null)
	const ctx = useRef(null)
	const img = useRef(new Image())

	const getColorAtClickPos = useCallback(e => {
		const { left, top } = cnv.current.getBoundingClientRect()
		const x = e.clientX - left
		const y = e.clientY - top
		const [ r, g, b ] = ctx.current.getImageData(x, y, 1, 1).data

		setEyedropper(({ active }) => ({
			active,
			pixelData: { r, g, b }
		}))
	}, [previewSize])

	const eyedropperProps = useMemo(() => eyedropper.active ? {
		className: 'eyedropper',
		onMouseDown: getColorAtClickPos
	} : {}, [eyedropper.active, cnv, ctx])

	useEffect(() => {
		ctx.current = cnv.current.getContext('2d')
	}, [])

	useEffect(() => {
		cnv.current.width = previewSize.width
		cnv.current.height = previewSize.height

		img.current.onload = () => {
			ctx.current.clearRect(0, 0, cnv.current.width, cnv.current.height)
			ctx.current.drawImage(img.current, 0, 0, cnv.current.width, cnv.current.height)
		}

		return () => {
			img.current.onload = ''
		}
	}, [previewSize])

	useEffect(() => {
		img.current.src = previewStill
	}, [previewStill, previewSize])

	return (
		<canvas
			ref={cnv}
			className={eyedropper.active ? 'eyedropper' : ''}
			{...eyedropperProps}></canvas>
	)
}

PreviewCanvas.propTypes = {
	previewStill: string.isRequired,
	previewSize: shape({
		width: number,
		height: number,
		frameWidth: number,
		frameHeight: number
	}),
	eyedropper: exact({
		active: oneOf([false, 'white', 'black', 'key', 'background']),
		pixelData: oneOfType([oneOf([false]), exact({
			r: string,
			g: string,
			b: string
		})])
	}).isRequired,
	setEyedropper: func.isRequired
}

export default PreviewCanvas
