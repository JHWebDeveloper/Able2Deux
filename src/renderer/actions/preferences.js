import toastr from 'toastr'

import * as ACTION from './types'
import { toastrOpts } from '../utilities'

const { interop } = window.ABLE2

export const loadPrefs = () => async dispatch => {
	try {
		dispatch({
			type: ACTION.UPDATE_STATE,
			payload: await interop.requestPrefs()
		})
	} catch (err) {
		toastr.error('Unable to load preferences', false, toastrOpts)
	}
}
