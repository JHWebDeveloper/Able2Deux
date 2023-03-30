import React, { useEffect, useRef } from 'react'
import 'css/splash.css'

import { drawAble2Logo } from 'utilities'

const { interop } = window.ABLE2

const Splash = () => {
	const cnv = useRef(null)

	useEffect(() => {
		cnv.current.width = 424
		cnv.current.height = 424

		drawAble2Logo(cnv.current.getContext('2d'))
	}, [])

	return (
		<>
			<canvas ref={cnv}></canvas>
			<h1>Able2{interop.version ? ` v${interop.version}` : ''}</h1>
			<p>Developed by Jonathan Hamilton</p>
		</>
	)
}

export default Splash
