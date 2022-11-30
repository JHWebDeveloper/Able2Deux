import React, { useEffect, useState } from 'react'

import { debounce, throttle } from 'utilities'

const scrollToTop = () => {
	window.scrollTo({
		top: 0,
		behavior: 'smooth'
	})
}

const BackToTop = () => {
	const [ backToTopVisible, setBackToTopVisible ] = useState(false)

	useEffect(() => {
		const main = document.querySelector('main')

		window.onscroll = debounce(() => {
			const { top } = main.getBoundingClientRect()

			if (top > 0 && backToTopVisible) {
				setBackToTopVisible(false)
			} else if (top < 1 && !backToTopVisible) {
				setBackToTopVisible(true)
			}
		}, 100)

		return () => window.onscroll = ''
	}, [backToTopVisible])

	return backToTopVisible ? (
		<button
			type="button"
			title="Back to Top"
			onClick={throttle(scrollToTop, 1000)}>first_page</button>
	) : <></>
}

export default BackToTop
