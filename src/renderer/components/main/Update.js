import React, { useEffect, useRef, useState } from 'react'

import { TAU, drawAble2Logo } from 'utilities'

const { interop } = window.ABLE2

const arcStart = Math.PI / 2

const Update = () => {
	const [ version, setVersion ] = useState(false)
	const [ percent, setPercent ] = useState(0)
	const [ error, setError ] = useState(false)
	const cnv = useRef(null)
	const ctx = useRef(null)

	useEffect(() => {
		cnv.current.width = 424
		cnv.current.height = 424
		ctx.current = cnv.current.getContext('2d')

		interop.addUpdateListeners({
			onStarted: setVersion,
			onProgress: setPercent,
			onError() {
				setError(true)
				setPercent(0)
			}
		})

		return () => {
			interop.removeUpdateListeners()
		}
	}, [])

	useEffect(() => {
		ctx.current.clearRect(0, 0, cnv.current.width, cnv.current.height)

		drawAble2Logo(ctx.current)

		ctx.current.strokeStyle = '#eeeeee'
		ctx.current.lineWidth = 6
		ctx.current.lineCap = 'round'
		ctx.current.beginPath()
		ctx.current.arc(212, 212, 200, -arcStart, percent / 100 * TAU - arcStart, false)
		ctx.current.stroke()
	}, [percent])

	return (
		<>
			<canvas ref={cnv}></canvas>
			{error ? <>
				<h1>Failed to Update</h1>
				<span>
					<button
						type="button"
						className="app-button"
						title="Retry"
						aria-label="Retry"
						onClick={() => {
							setError(false)
							interop.retryUpdate()
						}}>Retry</button>
					<button
						type="button"
						className="app-button"
						title="Quit"
						aria-label="Quit"
						onClick={() => interop.quit()}>Quit</button>
				</span>
			</> : <>
				<h1>Update found!</h1>
				<p>Downloading Able2{version ? ` v${version}` : ''}</p>
			</>}
		</>
	)
}

export default Update
