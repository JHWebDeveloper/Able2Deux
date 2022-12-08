import React, { useCallback, useContext } from 'react'

import { PrefsContext } from 'store/preferences'

import { updateNestedState } from 'actions'

import DirectorySelector from '../form_elements/DirectorySelector'

const ScratchDisk = () => {
	const { preferences, dispatch } = useContext(PrefsContext)
	const { scratchDisk } = preferences

	const updateScratchDisk = useCallback(property => value => {
		dispatch(updateNestedState('scratchDisk', {
			[property]: value
		}))
	}, [])

	const updateImports = useCallback(updateScratchDisk('imports'), [])
	const updateExports = useCallback(updateScratchDisk('exports'), [])
	const updatePreview = useCallback(updateScratchDisk('previews'), [])

	return (
		<form>
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
		</form>
	)
}

export default ScratchDisk
