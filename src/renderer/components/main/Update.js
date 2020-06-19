import React, { createRef, useEffect, useState } from 'react'

import { TAU, drawAble2Logo } from '../../utilities'

const { interop } = window.ABLE2

let cnv = false
let ctx = false

const arcStart = Math.PI / 2

const Update = () => {
	const [ version, onStarted ] = useState(false)
	const [ percent, onProgress ] = useState(0)
	const [ error, setError ] = useState(true)
	const ref = createRef()

	useEffect(() => {
		cnv = ref.current
		ctx = cnv.getContext('2d')
		cnv.width = cnv.height = 424

		interop.addUpdateListeners({
			onStarted,
			onProgress,
			onError() {
				setError(true)
				onProgress(0)
			}})

		return () => {
			interop.removeUpdateListeners()
		}
	}, [])

	useEffect(() => {
		ctx.clearRect(0, 0, cnv.width, cnv.height)

		drawAble2Logo(ctx)

		ctx.strokeStyle = '#eeeeee'
		ctx.lineWidth = 4
		ctx.lineCap = 'round'
		ctx.beginPath()
		ctx.arc(212, 212, 200, -arcStart, percent / 100 * TAU - arcStart, false)
		ctx.stroke()
	}, [])

	return (
		<>
			<canvas ref={ref}></canvas>
			{error ? <>
				<h1>Failed to Update</h1>
				<span>
					<button
						type="button"
						className="app-button"
						title="Retry"
						onClick={() => {
							setError(false)
							interop.retryUpdate()
						}}>Retry</button>
					<button
						type="button"
						className="app-button"
						title="Quit"
						onClick={interop.quit}>Quit</button>
				</span>
			</> : <>
				<h1>Update found!</h1>
				<p>Downloading Able2{version ? ` v${version}` : ''}</p>
			</>}
		</>
	)
}

export default Update
