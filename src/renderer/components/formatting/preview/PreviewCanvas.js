import React, { createRef, useCallback, useEffect, useMemo } from 'react'
import { bool, func, string } from 'prop-types'

import {} from 'actions'
import { rgbToHex, throttle } from 'utilities'

const img = new Image()
let cnv = false
let ctx = false

const PreviewCanvas = ({ previewStill, eyedropper, setEyedropToBgColor }) => {
	const ref = createRef()

	const getColorAtClickPos = useCallback(e => {
		const { left, top } = cnv.getBoundingClientRect()
		const x = e.clientX - left
		const y = e.clientY - top
	
		const rgb = ctx.getImageData(x, y, 1, 1).data
		const hex = rgbToHex(...rgb)

		setEyedropToBgColor(hex)
	}, [setEyedropToBgColor])

	const eyedropperProps = useMemo(() => eyedropper ? {
		className: 'eyedropper',
		onMouseDown() {
			cnv.onmousemove = throttle(getColorAtClickPos, 60)
		},
		onMouseUp() {
			cnv.onmousemove = ''
		}
	} : {}, [eyedropper, setEyedropToBgColor])

	useEffect(() => {
		cnv = ref.current
		ctx = cnv.getContext('2d')

		cnv.width = 384
		cnv.height = 216

		img.onload = () => {
			ctx.drawImage(img, 0, 0, cnv.width, cnv.height)
		}
	}, [])

	useEffect(() => {
		img.src = previewStill
	}, [previewStill])

	return (
		<canvas ref={ref} {...eyedropperProps} ></canvas>
	)
}

PreviewCanvas.propTypes = {
	previewStill: string.isRequired,
	eyedropper: bool.isRequired,
	setEyedropToBgColor: func.isRequired
}

export default PreviewCanvas
