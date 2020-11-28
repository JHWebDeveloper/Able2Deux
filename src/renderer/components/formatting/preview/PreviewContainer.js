import React, { useState } from 'react'

import Preview from './Preview'

const PreviewContainer = props => {
	const [ open, toggleOpen ] = useState(false)

	return (
		<details onToggle={() => { toggleOpen(!open) }} open>
			<summary>Preview</summary>
			{open && !!props.selected.id && <Preview {...props} />}
		</details>
	)
}

export default PreviewContainer
