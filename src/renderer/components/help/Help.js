import React from 'react'
import '../../css/help.css'

import TableOfContents from './TableOfContents'
import Acquisition from './Acquisition'
import Formatting from './Formatting'
import Rendering from './Rendering'
import Preferences from './Preferences'
import Updating from './Updating'
import BackToTop from './BackToTop'

const { interop } = window.ABLE2

const Help = () => {
	return (
		<>
			<header>
				<h1>Able2 Help</h1>
				<p>Able2 Version {interop.version}</p>
				<p>Able2 is an all-in-one News Editor&apos;s video acquisition tool developed by Jonathan Hamilton and customized for the Editors and Photographers of WFTV in Orlando, FL. Able2 is able to download media from various online services, record video and audio from a user&apos;s desktop and convert and format video, image and audio files for air.</p>
			</header>
			<TableOfContents />
			<main>
				<Acquisition />
				<Formatting />
				<Rendering />
				<Preferences />
				<Updating />
			</main>
			<BackToTop />
		</>
	)
}

export default Help
