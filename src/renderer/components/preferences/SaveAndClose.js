import React from 'react'
import { func, object } from 'prop-types'

import { savePrefs } from '../../actions/preferences'

const { interop } = window.ABLE2

const SaveAndClose = ({ prefs, dispatch }) => (
	<div id="save-prefs">
		<button
			type="button"
			className="app-button"
			title="Save and Close"
			onClick={() => {
				dispatch(savePrefs(prefs))
				interop.closeCurrentWindow()
			}}>Save &amp; Close</button>
		<button
			type="button"
			className="app-button"
			title="Save"
			onClick={() => dispatch(savePrefs(prefs))}>Save</button>
		<button
			type="button"
			className="app-button"
			title="Close"
			onClick={() => interop.closeCurrentWindow()}>Close</button>
	</div>
)

SaveAndClose.propTypes = {
	prefs: object.isRequired,
	dispatch: func.isRequired
}

export default SaveAndClose
