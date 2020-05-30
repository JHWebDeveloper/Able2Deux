import React from 'react'

const DirectorySelector = ({ directory, onClick }) => (
	<>
		<button
			type="button"
			className="app-button symbol"
			title="Choose directory"
			onClick={onClick}>folder</button>
		<input
			type="text"
			name="directory"
			title="Directory"
			value={directory}
			readOnly />
	</>
)

export default DirectorySelector
