/* eslint-disable react/no-unknown-property */

import React from 'react'

const { interop } = window.ABLE2

const NAMESPACE_ATTRIBUTES = Object.freeze({
	'xmlns:cc': 'http://creativecommons.org/ns#',
	'xmlns:dct': 'http://purl.org/dc/terms/'
})

const License = () => (
	<p
		className="license"
		{...NAMESPACE_ATTRIBUTES}>
		<span property="dct:title">Able2</span> by <span property="cc:attributionName">Jonathan Hamilton</span> is licensed under <br/>
		<a onClick={interop.openLicense}>
			CC BY-ND 4.0 
			<img src="https://mirrors.creativecommons.org/presskit/icons/cc.svg?ref=chooser-v1" alt="cc" />
			<img src="https://mirrors.creativecommons.org/presskit/icons/by.svg?ref=chooser-v1" alt="by" />
			<img src="https://mirrors.creativecommons.org/presskit/icons/nd.svg?ref=chooser-v1" alt="nd" />
		</a>
	</p>
)

export default License
