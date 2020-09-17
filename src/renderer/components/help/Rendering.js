import React from 'react'

const Rendering = () => (
	<section id="rendering">
		<h2>Rendering</h2>
		<p>After clicking save a window will show displaying the progress of each export. Similar to the ready queue, a circular icon <i style={{ color: '#bbb' }}>lens</i> to the left of each render process indicates the current status of the render. When the render is complete it will turn green <i style={{ color: '#0cf700' }}>lens</i>. Should there be an error during the render process or should you cancel a render it will turn red <i style={{ color: '#ff4800' }}>lens</i>. During rendering, the icon will be yellow <i style={{ color: '#fcdb03' }}>lens</i></p>
		<p>To cancel a render, click the <i>close</i> button the right of the render process.</p>
		<p>You may cancel all render processes by clicking the Cancel All button at the bottom.</p>
		<p>Once all processes have completed two buttons will appear.</p>
		<table>
			<thead>
				<tr>
					<th>Button</th>
					<th>Description</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td>Back</td>
					<td>Returns to the Formatting phase with all media and format settings preserved.</td>
				</tr>
				<tr>
					<td>Start Over</td>
					<td>Returns to the Acquisition phase and clears all media.</td>
				</tr>
			</tbody>
		</table>
	</section>
)

export default Rendering
