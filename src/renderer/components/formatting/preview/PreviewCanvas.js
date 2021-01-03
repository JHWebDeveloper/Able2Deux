import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { bool, func, string } from 'prop-types'

import { rgbToHex, throttle } from 'utilities'

const PreviewCanvas = ({ previewStill, eyedropper, setEyedropToBgColor }) => {
	const cnv = useRef()
	const ctx = useRef()
	const img = useMemo(() => new Image(), [])

	const getColorAtClickPos = useCallback(e => {
		const { left, top } = cnv.current.getBoundingClientRect()
		const x = e.clientX - left
		const y = e.clientY - top
	
		const rgb = ctx.current.getImageData(x, y, 1, 1).data
		const hex = rgbToHex(...rgb)

		setEyedropToBgColor(hex)
	}, [cnv, ctx, setEyedropToBgColor])

	const onMouseDown = useCallback(e => {
		getColorAtClickPos(e)

		const onMouseMove = throttle(getColorAtClickPos, 60)

		const clearOnMouseMove = () => {
			cnv.current.removeEventListener('mousemove', onMouseMove)
			window.removeEventListener('mouseup', clearOnMouseMove)
		}

		cnv.current.addEventListener('mousemove', onMouseMove)

		window.addEventListener('mouseup', clearOnMouseMove)
	}, [cnv, ctx, setEyedropToBgColor])

	const eyeDropperProps = useMemo(() => eyedropper ? {
		className: 'eyedropper',
		onMouseDown
	} : {}, [eyedropper, onMouseDown])

	useEffect(() => {
		cnv.current.width = 384
		cnv.current.height = 216
		ctx.current = cnv.current.getContext('2d')

		img.onload = () => {
			ctx.current.clearRect(0, 0, 384, 216)
			ctx.current.drawImage(img, 0, 0, 384, 216)
		}
	}, [])

	useEffect(() => {
		img.src = previewStill
	}, [previewStill])

	return (
		<canvas ref={cnv} {...eyeDropperProps} ></canvas>
	)
}

PreviewCanvas.propTypes = {
	previewStill: string.isRequired,
	eyedropper: bool.isRequired,
	setEyedropToBgColor: func.isRequired
}

export default PreviewCanvas
