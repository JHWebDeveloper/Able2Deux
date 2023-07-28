import React from 'react'
import { func } from 'prop-types'

import { cleanupPrefsAndSave, restoreDefaultPrefs } from 'actions'
import { useWarning } from 'hooks'

const SaveAndClose = ({ dispatch }) => {
	const restoreDefaultPrefsWarning = useWarning({
		message: 'Restore Default Preferences?',
		detail: 'Once saved, this cannot be undone. Proceed?',
		hasCheckbox: false,
		callback() {
			dispatch(restoreDefaultPrefs())
		}
	})

	return (
		<footer>
			<button
				type="button"
				className="app-button"
				title="Save and Close"
				onClick={() => {
					dispatch(cleanupPrefsAndSave(true))
				}}>Save &amp; Close</button>
			<button
				type="button"
				className="app-button"
				title="Save"
				onClick={() => {
					dispatch(cleanupPrefsAndSave())
				}}>Save</button>
			<button
				type="button"
				className="app-button"
				title="Close"
				onClick={window.ABLE2.interop.closePreferences}>Close</button>
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
