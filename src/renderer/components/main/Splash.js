import React, { createRef, useEffect } from 'react'
import '../../css/splash.css'

import { drawAble2Logo } from 'utilities'

const { interop } = window.ABLE2

const Splash = () => {
	const ref = createRef()

	useEffect(() => {
		const cnv = ref.current
		const ctx = cnv.getContext('2d')

		cnv.width = cnv.height = 424

		drawAble2Logo(ctx)
	}, [])

	return (
		<>
			<canvas ref={ref}></canvas>
			<h1>Able2 v{interop.version}</h1>
			<p>Developed by Jonathan Hamilton</p>
		</>
	)
}

export default Splash
