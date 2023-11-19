import React, { useCallback } from 'react'
import { func, string } from 'prop-types'

const { interop } = window.ABLE2

const DirectorySelector = ({ directory, onChange, ariaLabelledby }) => {
	const selectDirectory = useCallback(async () => {
		const { filePaths, canceled } = await interop.chooseDirectory()
		
		onChange(canceled ? directory : filePaths[0])
	}, [directory])
	
	return (
		<span className="directory-selector">
			<button
				type="button"
				className="app-button symbol"
				title="Choose directory"
				aria-label="Choose directory"
				onClick={selectDirectory}>folder</button>
			<input
				type="text"
				name="directory"
				title="Directory"
				className="panel-input"
				value={directory}
				{...ariaLabelledby ? { 'aria-labelledby': ariaLabelledby } : { 'aria-label': 'Directory' }}
				readOnly />
		</span>
	)
}

DirectorySelector.propTypes = {
	directory: string,
	onChange: func.isRequired,
	ariaLabelledby: string
}

export default DirectorySelector
