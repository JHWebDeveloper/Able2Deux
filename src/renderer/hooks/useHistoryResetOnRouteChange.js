import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

import { clearUndoHistory } from 'actions'

export const useHistoryResetOnRouteChange = dispatch => {
	const firstPageLoad = useRef(true)
	const location = useLocation()

	useEffect(() => {
		if (firstPageLoad.current) {
			firstPageLoad.current = false
		} else {
			dispatch(clearUndoHistory())
		}
	}, [location])
}
