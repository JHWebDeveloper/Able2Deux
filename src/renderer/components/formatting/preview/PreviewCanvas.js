import React, { useEffect, useMemo, useRef } from 'react'
import { string } from 'prop-types'

const PreviewCanvas = ({ previewStill }) => {
	const cnv = useRef()
	const ctx = useRef()
	const img = useMemo(() => new Image(), [])

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
		<canvas ref={cnv} ></canvas>
	)
}

PreviewCanvas.propTypes = {
	previewStill: string.isRequired
}

export default PreviewCanvas
