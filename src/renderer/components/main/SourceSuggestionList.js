import React, { useEffect, useState } from 'react'
import axios from 'axios'

const SourceSuggestionList = () => {
	const [ suggestions, loadSuggestions ] = useState([])

  useEffect(() => {
		(async () => {
			try {
				const sources = await axios.get('https://jhwebdeveloper.github.io/Able2-public-resources/data.json')

				loadSuggestions(sources.data.sort())
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
