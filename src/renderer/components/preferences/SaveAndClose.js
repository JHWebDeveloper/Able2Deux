import React, { useCallback } from 'react'
import { func } from 'prop-types'

import { fixLocationsAndSave, restoreDefaultPrefs } from 'actions'
import { warn } from 'utilities'

const { interop } = window.ABLE2

const SaveAndClose = ({ dispatch }) => {
	const restoreDefaultPrefsWarning = useCallback(() => warn({
		enabled: true,
		message: 'Restore Default Preferences?',
		detail: 'Once saved, this cannot be undone. Proceed?',
		callback() {
			dispatch(restoreDefaultPrefs())
		}
	}), [])

	return (
		<div id="save-prefs">
			<button
				type="button"
				className="app-button"
				title="Save and Close"
				onClick={() => {
					dispatch(fixLocationsAndSave(true))
				}}>Save &amp; Close</button>
			<button
				type="button"
				className="app-button"
				title="Save"
				onClick={() => {
					dispatch(fixLocationsAndSave())
				}}>Save</button>
			<button
				type="button"
				className="app-button"
				title="Close"
				onClick={interop.closeCurrentWindow}>Close</button>
			<button
				type="button"
				className="app-button"
				title="Restore Default"
				style={{ float: 'right' }}
				onClick={restoreDefaultPrefsWarning}>Restore Default</button>
		</div>
	)
}

SaveAndClose.propTypes = {
	dispatch: func.isRequired
}

export default SaveAndClose
