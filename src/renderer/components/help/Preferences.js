import React from 'react'

const { interop } = window.ABLE2

{/* <table>
	<thead>
		<tr>
			<th>Option</th>
			<th>Description</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			
		</tr>
	</tbody>
</table> */}

const Preferences = () => (
	<section id="preferences">
		<h2>Preferences</h2>
		<p>The Preferences window can be opened by selecting {interop.isMac ? 'Able2' : 'Edit'} &gt; Preferences.</p>
		<h3 id="acquisition-settings">Acquisition Settings</h3>
		<table>
			<thead>
				<tr>
					<th>Option</th>
					<th>Description</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td>Download Mode</td>
					<td>Set the default optimization mode for downloading media.</td>
				</tr>
				<tr>
					<td>Screen Capture Mode</td>
					<td>Set whether the screen recorder defaults to screen record or screenshot mode.</td>
				</tr>
				<tr>
					<td>Recorder Frame Rate</td>
					<td>Set the screen recorders framerate. Default is 60. Maximum is 120.</td>
				</tr>
				<tr>
					<td>Timer Duration</td>
					<td>Set the default duration for the screen recorder timer.</td>
				</tr>
				<tr>
					<td>Timer Enabled</td>
					<td>Set whether the screen record timer should be enabled or disabled by default.</td>
				</tr>
			</tbody>
		</table>
		<h3 id="formatting-settings">Formatting Settings</h3>
		<table>
			<thead>
				<tr>
					<th>Option</th>
					<th>Description</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td>Edit All by Default</td>
					<td>Set whether Edit All mode should be enabled or disabled by default.</td>
				</tr>
				<tr>
					<td>Slider Snap Points</td>
					<td>Set whether Able2's sliders should auto snap to marked points when in close proximity.</td>
				</tr>
				<tr>
					<td>Grid Buttons</td>
					<td>Choose which grid marker buttons you would like to appear in the preview window.</td>
				</tr>
				<tr>
					<td>Grid Color</td>
					<td>Select a color for the grid lines in the preview window. Default is magenta.</td>
				</tr>
				<tr>
					<td>Split Duration</td>
					<td>Set a default duration for the split option.</td>
				</tr>
				<tr>
					<td>Scale Slider Max</td>
					<td>Set a maximum value for the scale slider. Default is 400%.</td>
				</tr>
			</tbody>
		</table>
		<h3 id="warnings">Warnings</h3>
		<p>Enable or disable the various warning dialogs in Able2.</p>
		<h3 id="scratch-disks">Scratch Disks</h3>
		<p>Able2 uses three temporary folders to create media. They default to the user&apos;s temp folder, but can be changed manually. If you were using a device with multiple hard drives, you could set the folders on different drives and potentially get a slight performance boost.</p>
		<table>
			<thead>
				<tr>
					<th>Folder</th>
					<th>Description</th>
				</tr>
			</thead>
			<tbody>
				<tr>					
					<td>Import Cache</td>
					<td>The folder where Able2 creates or copies any downloaded or loaded media files, screen records, screenshots, selector thumbnails and source overlays.</td>
				</tr>
				<tr>
					<td>Export Cache</td>
					<td>The folder where Able2 creates the exported file before copying it to the selected Save Locations.</td>
				</tr>
				<tr>
					<td>Preview Cache</td>
					<td>The folder where Able2 creates the preview thumbnails visible in the Preview window.</td>
				</tr>
			</tbody>
		</table>
		<h3 id="output-options">Output Options</h3>
		<h4 id="output-resolution">Output Resolution</h4>
		<p>Set the resolution of the exported video or image. The two available resolutions are 1280x720 (default) and 1920x1080.</p>
		<h4 id="output-frame-rate">Output Frame Rate</h4>
		<p>Able2 will attempt to use the original frame rate of a video. You may set this option to 29.97 or 59.94 to always exports at that frame rate. You may also set a custom frame rate in the number field in the last option.</p>
		<h4 id="auto-export-as-png">Auto Export as .png</h4>
		<p>When exporting an uploaded image, Able2 can detect if a moving background is visible. If one is not visible Able2 will export a .png instead of a video file. Disabling this option will force Able2 to always export a video.</p>
		<p>The only exception to this is when AR Correction is set to Transform. In this case, if an image completely covers a moving background, a video will still be exported. A workaround is to simply set the background to transparent or black.</p>
		<h4 id="aspera-safe-characters">Aspera Safe Characters</h4>
		<p>When this option is enabled, any characters inside a file or batch name that cause Aspera imports to error out will be automatically replaced with an underscore. This will include all characters foreign to the roman alphabet.</p>
		<p>The characters % &amp; &quot; ` / \ : ; &lt; &gt; and ? will always be replaced regardless of whether this option is enabled or disabled.</p>
		<h4 id="concurrent-renders">Concurrent Renders</h4>
		<p>Sets how many exports Able2 will render simultaneously. Default is 2.</p>
		<h3 id="scratch-disks">Scratch Disks</h3>
		<p>Able2 uses three temporary folders to create media. They default to the user&apos;s temp folder, but can be changed manually. If you were using a device with multiple hard drives, you could set the folders on different drives and potentially get a slight performance boost.</p>
		<table>
			<thead>
				<tr>
					<th>Folder</th>
					<th>Description</th>
				</tr>
			</thead>
			<tbody>
				<tr>					
					<td>Import Cache</td>
					<td>The folder where Able2 creates or copies any downloaded or loaded media files, screen records, screenshots, selector thumbnails and source overlays.</td>
				</tr>
				<tr>
					<td>Export Cache</td>
					<td>The folder where Able2 creates the exported file before copying it to the selected Save Locations.</td>
				</tr>
				<tr>
					<td>Preview Cache</td>
					<td>The folder where Able2 creates the preview thumbnails visible in the Preview window.</td>
				</tr>
			</tbody>
		</table>
		<h3 id="warnings-and-defaults">Warnings and Defaults</h3>
		<table>
			<thead>
				<tr>
					<th>Option</th>
					<th>Description</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td>Remove Warning</td>
					<td rowSpan="4">Enable or disable the various warning dialogues throughout the app.</td>
				</tr>
				<tr>
					<td>Remove All Warning</td>
				</tr>
				<tr>
					<td>Apply to All Warning</td>
				</tr>
				<tr>
					<td>Source On Top Warning</td>
				</tr>
				<tr>
					<td>Edit All by Default</td>
					<td>Enabling this option will keep Edit All enabled by default when Able2 starts.</td>
				</tr>
				<tr>
					<td>Widescreen Grids</td>
					<td>Enabling this option will add grid markers for 1.85:1 and 2.39:1 in the preview window.</td>
				</tr>
				<tr>
					<td>Grid Color</td>
					<td>Select a color for the grid lines. Default is magenta.</td>
				</tr>
				<tr>
					<td>Scale Max</td>
					<td>Allows you to set a maximum value for the scale slider. Default is 400%.</td>
				</tr>
			</tbody>
		</table>
		<h3 id="save-locations-prefs">Save Locations</h3>
		<p>This is where you may edit Save Locations checklist that appears on Formatting phase.</p>
		<p>You may rearrange the order of the Save Locations by dragging and dropping.</p>
		<table>
			<thead>
				<tr>
					<th>Button/Field</th>
					<th>Description</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td>Default</td>
					<td>Sets whether the location is selected by default.</td>
				</tr>
				<tr>
					<td><i>add</i> / <i>remove</i></td>
					<td>Allows you to add a new Save Location or delete an existing one.</td>
				</tr>
				<tr>
					<td>Label</td>
					<td>Sets the label for the location that will appear in the Save Locations section. If this field is left blank, it will default to the folder name.</td>
				</tr>
				<tr>
					<td>Folder</td>
					<td>Sets the directory to save to.</td>
				</tr>
				<tr>
					<td><i>keyboard_arrow_up</i> / <i>keyboard_arrow_down</i></td>
					<td>Allows you to rearrange the order of the save locations. An accessible alternative ordering by drag and drop.</td>
				</tr>
			</tbody>
		</table>
	</section>
)

export default Preferences
