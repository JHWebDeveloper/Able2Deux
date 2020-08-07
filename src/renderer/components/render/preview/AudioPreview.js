import React from 'react'

import * as preview from './audioPreviewDataURLs'

const AudioPreview = ({ format }) => (
	<details open>
		<summary>Preview</summary>
		<div id="preview">
			<div>
				<div id="preview-container">
					<span style={{ backgroundImage: `url("data:image/jpeg;base64,/9j/${preview[format]}")` }}></span>
				</div>
			</div>
			<div style={{ height: '24px' }}></div>
		</div>
	</details>
)

export default AudioPreview
