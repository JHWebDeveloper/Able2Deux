import React, { useEffect, useState } from 'react'
import axios from 'axios'

const SourceSuggestionList = () => {
	const [ suggestions, setSuggestions ] = useState([])

	useEffect(() => {
		const controller = new AbortController()

		const getSourceSuggestions = async () => {
			try {
				const { signal } = controller
				const { data } = await axios.get('https://jhwebdeveloper.github.io/Able2-public-resources/source-suggestions.min.json', { signal })

				setSuggestions(data)
			} catch {
				return false
			}
		}

		getSourceSuggestions()

		return () => {
			controller.abort()
		}
	}, [])

	return (
		<datalist id="source-suggestions">
			{suggestions.map(src => <option key={src} value={src} />)}
		</datalist>
	)
}

export default SourceSuggestionList
