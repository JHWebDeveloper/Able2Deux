import React, { useEffect, useState } from 'react'
import axios from 'axios'

const SourceSuggestionList = () => {
	const [ suggestions, loadSuggestions ] = useState([])

	useEffect(() => {
		(async () => {
			try {
				const { data } = await axios.get('https://jhwebdeveloper.github.io/Able2-public-resources/source-suggestions.min.json')

				loadSuggestions(data)
			} catch (err) {
				return false
			}
		})()
	}, [])

	return (
		<datalist id="source-suggestions">
			{suggestions.map(src => <option key={src}>{src}</option>)}
		</datalist>
	)
}

export default SourceSuggestionList
