import React, { useCallback } from 'react'
import { exact, func, string } from 'prop-types'

import { updateNestedState } from 'actions'

import PrefsPanel from './PrefsPanel'
import DirectorySelector from '../form_elements/DirectorySelector'

const ScratchDisk = ({ scratchDisk, dispatch }) => {
	const updateScratchDisk = useCallback((property, value) => {
		dispatch(updateNestedState('scratchDisk', {
			[property]: value
		}))
	}, [])

	const updateImports = useCallback(dir => updateScratchDisk('imports', dir), [])
	const updateExports = useCallback(dir => updateScratchDisk('exports', dir), [])
	const updatePreview = useCallback(dir => updateScratchDisk('previews', dir), [])

	return (
		<PrefsPanel title="Scratch Disk" className="span-half">
			<label>Import Cache</label>
			<DirectorySelector
				directory={scratchDisk.imports}
				onChange={updateImports} />
			<label>Export Cache</label>
			<DirectorySelector
				directory={scratchDisk.exports}
				onChange={updateExports} />
			<label>Preview Cache</label>
			<DirectorySelector
				directory={scratchDisk.previews}
				onChange={updatePreview} />
		</PrefsPanel>
	)
}

ScratchDisk.propTypes = {
	scratchDisk: exact({
		imports: string,
		exports: string,
		previews: string
	}).isRequired,
	dispatch: func.isRequired
}

export default ScratchDisk
