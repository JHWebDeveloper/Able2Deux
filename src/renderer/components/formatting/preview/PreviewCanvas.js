import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { bool, func, string } from 'prop-types'

const PreviewCanvas = ({ previewStill, eyedropper, setEyedropper }) => {
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
		<canvas
			ref={cnv}
			className={eyedropper.active ? 'eyedropper' : ''}
			{...eyedropperProps}></canvas>
	)
}

PreviewCanvas.propTypes = {
	previewStill: string.isRequired,
	eyedropper: bool.isRequired,
	setEyedropper: func.isRequired
}

export default PreviewCanvas
