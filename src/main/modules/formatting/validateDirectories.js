import { dialog } from 'electron'

import { removeSaveLocation } from '../preferences/preferences'
import { fileExistsPromise } from '../utilities'

export const validateDirectories = async saveLocations => {
	saveLocations = saveLocations.filter(({ hidden, checked }) => !hidden && checked)
	
	const directories = new Set()
	let syncPrefs = false

	for await (const { directory, id } of saveLocations) {
		const exists = await fileExistsPromise(directory)

		if (exists) {
			directories.add(directory)
			continue
		}

		const { response, checkboxChecked } = await dialog.showMessageBox({
			type: 'warning',
			buttons: ['Continue', 'Abort'],
			message: 'Directory not found!',
			detail: `Unable to locate the directory "${directory}". This folder may have been deleted, removed or taken offline. Continue without saving to this directory?`,
			checkboxLabel: 'Remove from Save Locations'
		})

		if (response > 0) return { abort: true }

		if (!checkboxChecked) continue

		await removeSaveLocation(id)
		syncPrefs = true
	}

	if (!directories.size) {
		const { filePaths, canceled } = await dialog.showOpenDialog({
			buttonLabel: 'Choose',
			properties: ['openDirectory', 'createDirectory']
		})

		if (canceled) return { abort: true }

		directories.add(filePaths[0])
	}

	return {
		abort: false,
		directories: [...directories],
		syncPrefs
	}
}
