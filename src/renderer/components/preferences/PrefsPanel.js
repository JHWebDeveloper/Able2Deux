import React from 'react'
import { arrayOf, element, oneOfType, string } from 'prop-types'

const PrefsPanel = ({ className, title, children }) => (
	<div className={`prefs-panel ${className}`}>
		<h1>{title}</h1>
		{children}
	</div>
)

PrefsPanel.propTypes = {
	className: string,
	title: string.isRequired,
	children: oneOfType([element, arrayOf(element)])
}

export default PrefsPanel
