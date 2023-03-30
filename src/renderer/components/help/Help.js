import React from 'react'
import 'css/help.css'

import TableOfContents from './TableOfContents'
import Acquisition from './Acquisition'
import Formatting from './Formatting'
import Rendering from './Rendering'
import Preferences from './Preferences'
import Updating from './Updating'
import BackToTop from './BackToTop'

const { interop } = window.ABLE2

const Help = () => (
	<>
		<header>
			<h1>Able2 Help</h1>
			{interop.version ? <p>Able2 Version {interop.version}</p> : <></>}
			<p>Able2 is an all-in-one News Editor&apos;s video acquisition tool developed by Jonathan Hamilton and customized for the Editors and Photographers of WFTV in Orlando, FL. Able2 is able to download media from various online services, record video and audio from a user&apos;s desktop and convert and format video, image and audio files for air.</p>
			<p>Report bugs to <address>able2@jonathanhamilton.com</address></p>
			<p style={{ color: '#ff4800' }}>Please be advised that this help section is very out-of-date. Rewriting it is a bit too much for this lone developer to handle right now but an updated help section is on the to-do list for a future update. If you have any questions in the meantime, feel free to contact the email above.</p>
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

export default Help
