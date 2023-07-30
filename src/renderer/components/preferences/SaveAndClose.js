import React, { useCallback } from 'react'
import { func } from 'prop-types'

import { cleanupPrefsAndSave, restoreDefaultPrefs } from 'actions'
import { useWarning } from 'hooks'
import { objectsAreEqual } from 'utilities'

const { interop } = window.ABLE2

const SaveAndClose = ({ preferences, dispatch }) => {
	const restoreDefaultPrefsWarning = useWarning({
		message: 'Restore Default Preferences?',
		detail: 'Once saved, this cannot be undone. Proceed?',
		hasCheckbox: false,
		callback() {
			dispatch(restoreDefaultPrefs())
		}
	})

	const closeWithoutSaveWarning = useWarning({
		message: 'Close Without Saving?',
		details: 'You have unsaved changes. If you close preferences without saving these changes will revert to their previous state. Proceed?',
		hasCheckbox: false,
		callback() {
			interop.closePreferences()
		}
	})

	const closePrefs = useCallback(async () => {
		closeWithoutSaveWarning({
			skip: objectsAreEqual(await interop.requestPrefs(), preferences)
		})
	}, [preferences])

	const savePrefs = useCallback(closePrefs => {
		dispatch(cleanupPrefsAndSave(closePrefs))
	}, [])

	return (
		<footer>
			<button
				type="button"
				className="app-button"
				title="Save and Close"
				onClick={() => savePrefs(true)}>Save &amp; Close</button>
			<button
				type="button"
				className="app-button"
				title="Save"
				onClick={() => savePrefs()}>Save</button>
			<button
				type="button"
				className="app-button"
				title="Close"
				onClick={closePrefs}>Close</button>
			<button
				type="button"
				className="app-button"
				title="Restore Default"
				style={{ float: 'right' }}
				onClick={() => restoreDefaultPrefsWarning()}>Restore Default</button>
		</footer>
	)
}

SaveAndClose.propTypes = {
	dispatch: func.isRequired
}

export default SaveAndClose
