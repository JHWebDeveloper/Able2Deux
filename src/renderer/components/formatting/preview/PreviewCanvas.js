import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { exact, func, number, oneOf, string } from 'prop-types'

const PreviewCanvas = ({ previewStill, previewSize, eyedropper, setEyedropper }) => {
	const cnv = useRef()
	const ctx = useRef()
	const img = useMemo(() => new Image(), [])

	const getColorAtClickPos = useCallback(e => {
		const { left, top } = cnv.current.getBoundingClientRect()
		const x = e.clientX - left
		const y = e.clientY - top
		const [ r, g, b ] = ctx.current.getImageData(x, y, 1, 1).data

		setEyedropper({
			active: eyedropper.active,
			pixelData: { r, g, b }
		})
	}, [cnv, ctx, eyedropper])

	const eyedropperProps = useMemo(() => eyedropper.active ? {
		className: 'eyedropper',
		onClick: getColorAtClickPos
	} : {}, [eyedropper.active, cnv, ctx])

	useEffect(() => {
		ctx.current = cnv.current.getContext('2d')
	}, [])

	useEffect(() => {
		cnv.current.width = previewSize.width
		cnv.current.height = previewSize.height

		img.onload = () => {
			ctx.current.clearRect(0, 0, cnv.current.width, cnv.current.height)
			ctx.current.drawImage(img, 0, 0, cnv.current.width, cnv.current.height)
		}

		return () => img.onload = ''
	}, [previewSize])

	useEffect(() => {
		img.src = previewStill
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
	previewSize: exact({
		width: number,
		height: number
	}),
	eyedropper: exact({
		active: oneOf([false, 'white', 'black']),
		pixelData: oneOf([false, exact({
			r: string,
			g: string,
			b: string
		})])
	}).isRequired,
	setEyedropper: func.isRequired
}

export default PreviewCanvas
