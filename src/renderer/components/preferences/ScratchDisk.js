import React, { useCallback } from 'react'
import { exact, func, string } from 'prop-types'

import { updateScratchDisk } from 'actions'

import DirectorySelector from '../form_elements/DirectorySelector'

const ScratchDisk = ({ scratchDisk, dispatch }) => {
	const dispatchUpdateScratchDisk = useCallback(property => value => {
		dispatch(updateScratchDisk({
			[property]: value
		}))
	}, [])

	const updateImports = useCallback(dispatchUpdateScratchDisk('imports'), [])
	const updateExports = useCallback(dispatchUpdateScratchDisk('exports'), [])
	const updatePreview = useCallback(dispatchUpdateScratchDisk('previews'), [])

	return (
		<fieldset>
			<legend>Scratch Disks:</legend>
			<span className="scratch-disk">
				<label>Import Cache</label>
				<DirectorySelector
					directory={scratchDisk.imports}
					onChange={updateImports} />
			</span>
			<span className="scratch-disk">
				<label>Export Cache</label>
				<DirectorySelector
					directory={scratchDisk.exports}
					onChange={updateExports} />
			</span>
			<span className="scratch-disk">
				<label>Preview Cache</label>
				<DirectorySelector
					directory={scratchDisk.previews}
					onChange={updatePreview} />
			</span>
		</fieldset>
	)
}

ScratchDisk.propTypes = {
	scratchDisk: exact({
		imports: string,
		previews: string,
		exports: string
	}).isRequired,
	dispatch: func.isRequired
}

export default ScratchDisk
