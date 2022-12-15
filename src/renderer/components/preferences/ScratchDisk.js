import React, { useCallback } from 'react'
import { exact, func, string } from 'prop-types'

import { updateNestedState } from 'actions'

import DirectorySelector from '../form_elements/DirectorySelector'

const ScratchDisk = ({ scratchDisk, dispatch }) => {
	const updateScratchDisk = useCallback(property => value => {
		dispatch(updateNestedState('scratchDisk', {
			[property]: value
		}))
	}, [])

	const updateImports = useCallback(updateScratchDisk('imports'), [])
	const updateExports = useCallback(updateScratchDisk('exports'), [])
	const updatePreview = useCallback(updateScratchDisk('previews'), [])

	return (
		<fieldset>
			<legend>Scratch Disks</legend>
			<span className="input-option">
				<label>Import Cache</label>
				<DirectorySelector
					directory={scratchDisk.imports}
					onChange={updateImports} />
			</span>
			<span className="input-option">
				<label>Export Cache</label>
				<DirectorySelector
					directory={scratchDisk.exports}
					onChange={updateExports} />
			</span>
			<span className="input-option">
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
