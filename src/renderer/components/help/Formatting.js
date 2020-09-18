import React from 'react'

import { replaceTokens } from '../../utilities'

const { interop } = window.ABLE2

const Formatting = () => (
	<section id="formatting">
		<h2>Formatting</h2>
		<p>The formatting phase is where we edit the appearance of the media and export it.</p>
		<p>If at any time you wish add media to the batch, you may hit the Back button at the bottom left corner of the app to go back to Acquisition phase. All current format settings will be retained when you return.</p>
		<h3 id="media-selector">Media Selector</h3>
		<p>Directly under the Able2 title you will see the Media Selector window. There you will see each media item you imported listed. Here we can select which media item to edit.</p>
		<p>Click the media item to select it. You will then see some basic media data populate at the top of the selector. The data will vary depending on the media type. You will also see the section in the right hand column populate. At the top is a preview of how the media will appear in Avid. All sections below the preview are where we will format the media for export.</p>
		<p>Media items are automatically ordered by most recent import descending. This order can be rearranged by dragging and dropping the media items on top of each other. This feature can be used to change numbering inside the filename and/or render priority.</p>
		<p>Clicking the <i>close</i> button to the right of any media item will remove it from the batch.</p>
		<h4 id="media-options">Media Options</h4>
		<p>Each media item has an options menu. It can be accessed by clicking the <i>more_vert</i> icon to the left of the media item.</p>
		<table>
			<thead>
				<tr>
					<th>Option</th>
					<th>Description</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td>Copy All Settings</td>
					<td>Copies all of the media item&apos;s format settings to be pasted to another media item.</td>
				</tr>
				<tr>
					<td>Paste Settings</td>
					<td>Applies copied format setting(s) to the media item.</td>
				</tr>
				<tr>
					<td>Apply Settings to All</td>
					<td>Applies the media items format settings to all other media items.</td>
				</tr>
				<tr>
					<td>Move Up</td>
					<td rowSpan="2">Moves the media item up or down by one position. An accessible alternative to ordering by drag and drop.</td>
				</tr>
				<tr>
					<td>Move Down</td>
				</tr>
				<tr>
					<td>Duplicate Media</td>
					<td>Makes a copy of the media item and inserts it above. Different format settings can be applied to the copy allowing you export multiple versions of the same media.</td>
				</tr>
				<tr>
					<td>Remove Media</td>
					<td>Removes a media item from the batch. Same as clicking the <i>close</i> button to the right of the media item.</td>
				</tr>
				<tr>
					<td>Reveal in Cache</td>
					<td>Reveals the media file in the imports cache folder. Can be used as a failsafe for when a download succeeds but a render fails. This will give you access to the original download file.</td>
				</tr>
			</tbody>
		</table>
		<h4 id="edit-all">Edit All</h4>
		<p>The Edit All switch can be found at the bottom of the Media Selector. It will only appear if more than one media item is present. When Edit All is enabled, changes to any media item will be applied to all others in the batch.</p>
		<p>It is important to note that Edit All is not the same as Apply to All. Only changes made AFTER enabling Edit All will be applied to all. To apply current settings to all media, see the previous section.</p>
		<p>Filename, Start and End are the only settings unique to their media item and are unaffected by Edit All.</p>
		<p>Edit All can be switched on by default under {interop.isMac ? 'Able2' : 'Edit'} &gt; Preferences</p>
		<h3 id="preview-window">Preview Window</h3>
		<p>When a media item is selected, the Preview Window will display a thumbnail preview of the media with current settings applied.</p>
		<p>For audio exports, the preview window displays split channel waveform data.</p>
		<h4 id="frame-slider">Frame Slider</h4>
		<p>The Frame Slider allows you to select a frame inside the video to preview. The timecode is displayed on the left side of the slider. It is only available for videos.</p>
		<p>To the right of the slider are two increment buttons. Clicking these will increment the frame slider by 1 frame. Holding the shift will the increment amount to 10 frames.</p>
		<h4 id="grids">Grids</h4>
		<p>The Preview Window has four grid overlays that can be toggled on or off the first of which is a standard 16:9 title safe grid with thirds and center markers. The other grid buttons will reveal markers for aspect ratios 4:3, 1:1, and 9:16.</p>
		<p>The grid color can be changed and additional grid buttons for 1.85:1 and 2.39:1 can be enabled under {interop.isMac ? 'Able2' : 'Edit'} &gt; Preferences.</p>
		<h3 id="media-formatting-sections">Media Formatting Sections</h3>
		<p>Under the preview window are a number of collapsible sections each containing options to format the media for export.</p>
		<h4 id="file">File</h4>
		<p>Provides options for the exported file. This is the only section unaffected by the Edit All and Apply to All features.</p>
		<h5 id="filename">Filename</h5>
		<p>This is where you enter the title of the file to export. Able2 will attempt to auto fill this with the original filename or media title from a URL.</p>
		<p>The filename field accepts tokens. Please see the <a href="#tokens" title="Go to Tokens">Batch Naming section</a> for details.</p>
		<p>Able2 will automatically append numbering to duplicate filenames in <q>&lt;#&gt; of &lt;total&gt;</q> format.</p>
		<h5 id="start-and-end">Start &amp; End</h5>
		<p>Allows you to export a section of video or audio. Both fields must be switched on to take effect and accept an HH:MM:SS timecode format.</p>
		<p>If the start time exceeds the duration or set end time, the export will error.</p>
		<p>The Start and End fields will not display for image files.</p>
		<h4 id="audio">Audio</h4>
		<p>The section provides you with a few additional exported file options for video and audio files only.</p>
		<h5 id="export-as">Export As</h5>
		<p>Able2 allows you to export video only, audio only or both. When audio only is selected, the adjacent Audio Format option will enable.</p>
		<p>The Export As option will not appear for audio files and Audio Format will be enabled by default.</p>
		<h5 id="audio-format">Audio Format</h5>
		<p>Set the format of an audio only export. You may choose .wav (lossless), .mp3 (lossy) or export as a video with SMPTE color bars overlaid. Video format will be H.264 .mp4.</p>
		<h4 id="formatting-section">Formatting</h4>
		<p>Provides options for the videos appearance within a 16:9 frame. Formatting and all following sections are for video and images only and will not display for audio.</p>
		<h5 id="ar-correction">AR Correction</h5>
		<p>Allows you to adjust how the media fits inside a 16:9 frame. You have 4 options. If the video already has a 16:9 aspect ratio, only the Transform option will have any effect.</p>
		<table>
			<thead>
				<tr>
					<th>Option</th>
					<th>Description</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td>None</td>
					<td>Preserves the media&apos;s original aspect ratio and does not resize or distort it.</td>
				</tr>
				<tr>
					<td>Fill Frame</td>
					<td>Resizes the media so that the entire frame is covered, cropping if necessary. The edges of the media&apos;s smallest dimension will be touching the edges of the frame. Selecting Fill Frame will enable a position slider to adjust the media&apos;s centering.</td>
				</tr>
				<tr>
					<td>Fit Inside Frame</td>
					<td>Resizes the media to its maximum size inside the frame without cropping. The edges of the media&apos;s largest dimension will be touching the edges of the frame.</td>
				</tr>
				<tr>
					<td>Transform</td>
					<td>Enables Position, Scale and Crop sliders to allow you to freely adjust how the media fits inside the frame.</td>
				</tr>
			</tbody>
		</table>
		<h5 id="background">Background</h5>
		<p>Sets a background to appear behind the video should. Options are WFTV Blue and Grey Backgrounds, Transparent or Black.</p>
		<p>Choosing Transparent for a video will add an alpha channel to the export and change the format to Apple ProRres .mov as the standard H.264 does not support an alpha channel.</p>
		<h5 id="box-overlay">Box Overlay</h5>
		<p>Contains the video in a graphic box. Options are None or standard WFTV TV and Laptop graphics.</p>
		<h4 id="source">Source</h4>
		<p>The Source section allows you to overlay a source attribution on a video or image. The source overlay features the WFTV standard sourcing format.</p>
		<p>The Source section will appear when AR Correction is set to Fill Frame, Fit Inside Frame or Transform. When set to None, the section will only appear if the media&apos;s native aspect ratio is 16:9.</p>
		<h5 id="source-name">Source Name</h5>
		<p>The source name field is where you may enter the name of the person, company, etc. you wish to attribute.</p>
		<p>Source names will be suggested as you type. An internet connection is required for source name suggestions as the source list is stored remotely. Since Able2 is customized for WFTV in Orlando, Fl, the suggested source names are predominately Central Florida related.</p>
		<h5 id="add-source-to-beginning">Add <q>Source: </q> to beginning</h5>
		<p>Whether to insert <q>Source: </q> in front of the attribution. This option is checked by default and in almost all cases should stay that way. Exceptions would be for important notes like <q>SIMULATION</q> or <q>FAMILY PHOTO</q>.</p>
		<p>If you accidentally type <q>Source: </q> in the source name field, Able2 will detect it and delete it. It will not appear twice.</p>
		<h5 id="place-source-at-top-of-video">Place source at top of video</h5>
		<p>Puts the source at the top edge of the video or image rather than the bottom. The WFTV standard is to have the source at the bottom, so in most cases this should be left unchecked as it is by default. The Source on Top feature should only be used when the source overlay appears illegible or is obscuring important details at the bottom of the video.</p>
		<h4 id="position-fill-frame">Position (Fill Frame)</h4>
		<p>Accessible when AR Correction is set to Fill Frame</p>
		<p>Allows you to set the center Position percentage of the video as it is cropped in the frame. Whether the X or Y axis are adjusted will be automatically determined by the orientation of the video. If the video has a 16:9 aspect ratio, the Position slider will not appear.</p>
		<h4 id="position-transform">Position (Transform)</h4>
		<p>Accessible when AR Correction is set to Transform</p>
		<p>Allows you to adjust the position percentage of the media along the X and Y axis.</p>
		<p>Both position percentages can be manually entered into the each slider&apos;s adjacent number field. These fields accept decimal values and can be incremented by pressing the up and down arrow keys.</p>
		<h4 id="scale">Scale</h4>
		<p>Accessible when AR Correction is set to Transform</p>
		<p>Allows you to resize or distort the media along the X and Y Axis.</p>
		<p>The link button, enabled by default, will preserve to media&apos;s current proportions as you adjust either slider.</p>
		<p>Both sliders have a small button adjacent to them. While the link is enabled, the X slider&apos;s button will resize the media to fit inside the frame width while the Y slider&apos;s button will resize the media to fit inside the frame height. If the link is disabled, the buttons will stretch the media to the frame dimensions instead of fit.</p>
		<p>Both scale percentages can be manually entered into the each slider&apos;s adjacent number field. These fields accept decimal values, can be set higher than the slider&apos;s maximum value, and can be incremented by pressing the up and down arrow keys.</p>
		<p>Both sliders default maximum value is 400%. This can be increased or decreased under {interop.isMac ? 'Able2' : 'Edit'} &gt; Preferences.</p>
		<h4 id="crop">Crop</h4>
		<p>Accessible when AR Correction is set to Transform</p>
		<p>Allows you to crop the media from the Top, Bottom, Left and Right edges. The resulting crop will auto center at the set X/Y Position.</p>
		<p>There are two buttons enabled by default that link the Top and Bottom sliders and Left and Right sliders. While enabled, adjusting one edge will auto crop the opposite edge with the same percentage.</p>
		<p>Crop percentages for all four edges can be manually entered into the each slider&apos;s adjacent number field. These fields accept decimal values and can be incremented by pressing the up and down arrow keys.</p>
		<h4 id="rotation">Rotation</h4>
		<p>Allows you to adjust the orientation of the video.</p>
		<h5 id="rotate">Rotate</h5>
		<p>Flips the video by increments of 90°. Default is 0° or none.</p>
		<h5 id="reflect">Reflect</h5>
		<p>Mirror the video along a horizontal or vertical axis or both.</p>
		<p>Please note that setting Reflect to Horizontal + Vertical is the same as setting Rotate to 180°, thus if both of these settings are applied they will cancel each other out.</p>
		<h4 id="setting-options">Setting Options</h4>
		<p>If more than one media item is present, you will see a small <i>more_vert</i> icon in the top right corner of each section (with the exception of the File section). Clicking this will reveal a menu with two options outlined below.</p>
		<table>
			<thead>
				<tr>
					<th>Option</th>
					<th>Description</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td>Copy Setting</td>
					<td>Copies all settings within the containing section. These settings can then be applied to other individual media items using the Paste option in the Media Selector. See the <a href="#media-options" title="Go to Media Options">Media Options section</a> for details.</td>
				</tr>
				<tr>
					<td>Apply to All</td>
					<td>Applies all settings within the containing section to all other media items in the batch.</td>
				</tr>
			</tbody>
		</table>
		<h3 id="batch-naming">Batch Naming</h3>
		<p>The Batch Name feature allows you to name each export with a uniform name, rather than each individual filename.</p>
		<p>To apply a Batch Name simply enter a batch name into the corresponding field.</p>
		<h4 id="tokens">Tokens</h4>
		<p>To set a uniform name, the batch name field allows for the use of tokens, symbols you may type starting with a $ that will be automatically replaced with dynamic data. Available tokens include:</p>
		<table>
			<thead>
				<tr>
					<th>Token</th>
					<th>Replacement</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td>$t</td>
					<td>Timestamp 12 hour format (e.g. {replaceTokens('$t')})</td>
				</tr>
				<tr>
					<td>$T</td>
					<td>Timestamp 24 hour format (e.g. {replaceTokens('$T')})</td>
				</tr>
				<tr>
					<td>$d</td>
					<td>Long Date (e.g. {replaceTokens('$d')})</td>
				</tr>
				<tr>
					<td>$D</td>
					<td>Short Date (e.g. {replaceTokens('$D')})</td>
				</tr>
				<tr>
					<td>$n</td>
					<td>Number of the item in the batch in ascending order</td>
				</tr>
				<tr>
					<td>$r</td>
					<td>Number of the item in the batch in descending order</td>
				</tr>
				<tr>
					<td>$b</td>
					<td>Total number of items in the batch</td>
				</tr>
			</tbody>
		</table>
		<p>Tokens also work in the Filename field.</p>
		<h4 id="batch-name-options">Batch Name Options</h4>
		<table>
			<thead>
				<tr>
					<th>Option</th>
					<th>Description</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td>Replace</td>
					<td>Replace all filenames with the batch name. If $n or $r tokens are not detected inside the batchname, $n of $b will automatically append to the end.</td>
				</tr>
				<tr>
					<td>Prepend</td>
					<td>Batch name will be added to the front of each filename separated by a space.</td>
				</tr>
				<tr>
					<td>Append</td>
					<td>Batch name will be added to the end of each filename separated by a space.</td>
				</tr>
			</tbody>
		</table>
		<h3 id="save-locations">Save Locations</h3>
		<p>Select the directories where Able2 will save the export(s).</p>
		<p>Save Locations are customizable under {interop.isMac ? 'Able2' : 'Edit'} &gt; Preferences. For more details see Save Locations the Preferences section.</p>
		<p>When clicking Save, if all Save Locations are unchecked and/or not found, you will be prompted to choose a directory.</p>
	</section>
)

export default Formatting
