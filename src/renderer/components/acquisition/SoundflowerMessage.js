import React, { useEffect, useState } from 'react'

const { interop } = window.ABLE2

const SoundflowerMessage = () => {
	const [ show, setShow ] = useState(false)

	useEffect(() => {
		(async () => {
			setShow(!await interop.findSoundflower())
		})()
	}, [])

	return show ? (
		<a title="Get Soundflower" onClick={interop.getSoundflower}>
			(Soundflower is required for audio on Mac)
		</a>
	) : <></>
}

export default SoundflowerMessage
