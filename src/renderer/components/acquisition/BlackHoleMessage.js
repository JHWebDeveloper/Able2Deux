import React, { useEffect, useState } from 'react'

const { interop } = window.ABLE2

const BlackHoleMessage = () => {
	const [ show, setShow ] = useState(false)

	useEffect(() => {
		(async () => {
			setShow(!await interop.findBlackHole())
		})()
	}, [])

	return show ? (
		<a
			title="Get BlackHole"
			aria-label="Get Blackhole"
			onClick={interop.getBlackHole}>
			(BlackHole is required for audio on Mac)
		</a>
	) : <></>
}

export default BlackHoleMessage
