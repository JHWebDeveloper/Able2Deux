import { useCallback, useContext } from 'react'

import { PrefsContext } from 'store'
import { disableWarningAndSave } from 'actions'

export const useWarning = ({
	name: warningName,
	message: fixedMessage,
	detail: fixedDetail = 'This cannot be undone. Proceed?',
	callback: fixedCallback,
	hasCheckbox = true
}, dependencies = []) => {
	const { preferences, dispatch } = useContext(PrefsContext)
	const { warnings } = preferences

	const disableWarning = useCallback(() => {
		dispatch(disableWarningAndSave(warningName))
	}, [warningName])

	const warn = useCallback(async ({
		message = fixedMessage,
		detail = fixedDetail,
		callback = fixedCallback
	} = {}) => {
		if (!warningName || warnings[warningName]) {
			const { response, checkboxChecked } = await window.ABLE2.interop.warning({
				message,
				detail,
				hasCheckbox
			})
	
			if (response > 0) return false
	
			if (hasCheckbox && checkboxChecked) disableWarning()
		}
	
		callback()

		return true
	}, [warnings, warningName, fixedMessage, fixedDetail, fixedCallback, hasCheckbox, ...dependencies])

	return warn
}
