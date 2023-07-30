import { useCallback, useContext } from 'react'

import { PrefsContext } from 'store'
import { disableWarningAndSave } from 'actions'

const { warning } = window.ABLE2.interop

export const useWarning = ({
	name: warningName,
	message: fixedMessage,
	detail: fixedDetail = 'This cannot be undone. Proceed?',
	callback: fixedCallback,
	skip: fixedSkip,
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
		callback = fixedCallback,
		skip = fixedSkip
	} = {}) => {
		if (!skip && (!warningName || warnings[warningName])) {
			const { response, checkboxChecked } = await warning({
				message,
				detail,
				hasCheckbox
			})
	
			if (response > 0) return
			if (hasCheckbox && checkboxChecked) disableWarning()
		}
	
		callback()
	}, [warnings, warningName, fixedSkip, fixedMessage, fixedDetail, fixedCallback, hasCheckbox, ...dependencies])

	return warn
}

export const useSaveWarning = ({
	message: fixedMessage = 'You Have Unsaved Changes!',
	detail: fixedDetail,
	onConfirm: fixedOnConfirm,
	onSave: fixedOnSave,
	skip: fixedSkip
}, dependencies = []) => {
	const warn = useCallback(async ({
		message = fixedMessage,
		detail = fixedDetail,
		onConfirm = fixedOnConfirm,
		onSave = fixedOnSave,
		skip = fixedSkip
	} = {}) => {
		if (!skip) {
			const { response } = await warning({
				message,
				detail,
				buttons: ['Close', 'Save & Close', 'Cancel']
			})

			if (response > 1) return
			if (response === 1) return onSave()
		}

		onConfirm()
	}, [fixedSkip, fixedMessage, fixedDetail, fixedOnConfirm, fixedOnSave, ...dependencies])

	return warn
}
