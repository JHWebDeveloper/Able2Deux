import { useState, useCallback } from 'react'

export const useClipboard = () => {
	const [ clipboard, setClipboard ] = useState({})

	const copyToClipboard = useCallback(properties => {
		setClipboard({ ...properties })
	}, [])

	return [ clipboard, copyToClipboard ]
}

export default useClipboard
