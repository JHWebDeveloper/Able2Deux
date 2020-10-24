import React, { createRef, useEffect, useState } from 'react'
import 'css/splash.css'

import { drawAble2Logo } from 'utilities'

const { interop } = window.ABLE2

const Splash = () => {
	const [ version, setVersion ] = useState(false)
	const ref = createRef()

	useEffect(() => {
		(async () => {
			setVersion(await interop.getVersion())
		})()

		const cnv = ref.current
		const ctx = cnv.getContext('2d')

		cnv.width = cnv.height = 424

		drawAble2Logo(ctx)
	}, [])

	return (
		<>
			<canvas ref={ref}></canvas>
			<h1>Able2{version ? ` v${version}` : ''}</h1>
			<p>Developed by Jonathan Hamilton</p>
		</>
	)
}

export default Splash
