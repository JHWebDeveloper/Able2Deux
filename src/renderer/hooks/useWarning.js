import { useCallback, useContext } from 'react'

import { PrefsContext } from 'store'
import { disableWarningAndSave } from 'actions'

const { warning } = window.ABLE2.interop

export const useWarning = ({
	name: warningName,
	message: fixedMessage,
	detail: fixedDetail,
	onConfirm: fixedOnConfirm,
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
		onConfirm = fixedOnConfirm,
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
	
		onConfirm()
	}, [warnings, warningName, fixedMessage, fixedDetail, fixedOnConfirm, hasCheckbox, fixedSkip, ...dependencies])

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
				buttons: ['Save & Close', 'Close', 'Cancel']
			})

			if (response > 1) return
			if (response === 0) onSave()
		}

		onConfirm()
	}, [fixedMessage, fixedDetail, fixedOnConfirm, fixedOnSave, fixedSkip, ...dependencies])

	return warn
}
