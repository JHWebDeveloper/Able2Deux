import { useCallback, useState } from 'react'

const validURLRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/

export const useValidURL = initState => {
	const [ urlData, setURLData ] = useState([initState, false])

	const updateURLData = useCallback(url => setURLData([
		url,
		validURLRegex.test(url)
	]), [])

	return [ ...urlData, updateURLData ]
}
