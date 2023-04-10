import React, { useEffect, useState } from 'react'
import axios from 'axios'

const SourceSuggestionList = () => {
	const [ suggestions, setSuggestions ] = useState([])

	useEffect(() => {
		(async () => {
			try {
				const { data } = await axios.get('https://jhwebdeveloper.github.io/Able2-public-resources/source-suggestions.min.json')

				setSuggestions(data)
			} catch {
				return false
			}
		})()
	}, [])

	return (
		<datalist id="source-suggestions">
			{suggestions.map(src => <option key={src} value={src} />)}
		</datalist>
	)
}

export default SourceSuggestionList
