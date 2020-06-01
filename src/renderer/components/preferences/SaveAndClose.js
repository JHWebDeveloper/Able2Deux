import React from 'react'
import toastr from 'toastr'

import { toastrOpts } from '../../utilities'

const { interop } = window.ABLE2

const savePrefs = async prefs => {
	try {
		await interop.savePrefs(prefs)
		toastr.success('Preferences saved', false, { ...toastrOpts, timeOut: 2000 })
	} catch (err) {
		toastr.error('Preferences failed to save', false, toastrOpts)
	}
}

const SaveAndClose = props => (
	<div id="save-prefs">
		<button
			type="button"
			className="app-button"
			title="Save"
			onClick={() => savePrefs(props)}>Save</button>
		<button
			type="button"
			className="app-button"
			title="Close"
			onClick={interop.closeCurrentWindow}>Close</button>
	</div>
)

export default SaveAndClose
