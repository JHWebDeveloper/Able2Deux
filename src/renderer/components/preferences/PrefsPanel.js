import React from 'react'
import { arrayOf, element, oneOf, string } from 'prop-types'

const PrefsPanel = ({ className, title, children }) => (
	<div className={`prefs-panel ${className}`}>
		<h1>{title}</h1>
		{children}
	</div>
)

PrefsPanel.propTypes = {
	className: string,
	title: string.isRequired,
	children: oneOf([element, arrayOf(element)])
}

export default PrefsPanel
