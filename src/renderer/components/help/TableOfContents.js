import React from 'react'

const { interop } = window.ABLE2

const TableOfContents = () => (
	<nav>
		<h2>Table of Contents</h2>
		<ul>				
			<li><a href="#aquisition" title="Go to Acquisition">Acquisition</a></li>
			<ul>
				<li><a href="#downloading-from-a-url" title="Go to Downloading from a URL">Downloading from a URL</a></li>
				<ul>
					<li><a href="#optimization-options" title="Go to Optimization Options">Optimization Options</a></li>
					<li><a href="#downloading-a-livestream" title="Go to Downloading a Livestream">Downloading a Livestream</a></li>
				</ul>
				<li><a href="#loading-files-from-your-device" title="Go to Loading File(s) from Your Device">Loading File(s) from Your Device</a></li>
				<li><a href="#screen-recording" title="Go to Screen Recording">Screen Recording</a></li>
				<ul>
					<li><a href="#stop-timer" title="Go to Stop Timer">Stop Timer</a></li>
					<li><a href="#screenshot-mode" title="Go to Screenshot Mode">Screenshot Mode</a></li>
					{interop.IS_MAC ? <>
						<li><a href="#audio-support-for-mac" title="Go to Audio Support for Mac">Audio Support for Mac</a></li>
						<ul>
							<li><a href="#before-starting-a-screen-record" title="Go to Before Starting a Screen Record">Before Starting a Screen Record</a></li>
						</ul>
					</> : <></>}
				</ul>
				<li><a href="#the-ready-queue" title="Go to The Ready Queue">The Ready Queue</a></li>
			</ul>
			<li><a href="#formatting" title="Go to Formatting">Formatting</a></li>
			<ul>
				<li><a href="#media-selector" title="Go to Media Selector">Media Selector</a></li>
				<ul>
					<li><a href="#media-options" title="Go to Media Options">Media Options</a></li>
					<li><a href="#edit-all" title="Go to Edit All">Edit All</a></li>
				</ul>
				<li><a href="#preview-window" title="Go to Preview Window">Preview Window</a></li>
				<ul>
					<li><a href="#frame-slider" title="Go to Frame Slider">Frame Slider</a></li>
					<li><a href="#screengrabs" title="Go to Screengrabs">Creating Screengrabs</a></li>
					<li><a href="#grids" title="Go to Grids">Grids</a></li>
				</ul>
				<li><a href="#media-formatting-sections" title="Go to Media Formatting Sections">Media Formatting Sections</a></li>
				<ul>
					<li><a href="#file" title="Go to File">File</a></li>
					<ul>
						<li><a href="#filename" title="Go to Filename">Filename</a></li>
						<li><a href="#start-and-end" title="Go to Start &amp; End">Start &amp; End</a></li>
						<li><a href="#split" title="Go to Split">Split</a></li>
					</ul>
					<li><a href="#audio" title="Go to Audio">Audio</a></li>
					<ul>
						<li><a href="#export-as" title="Go to Export As">Export As</a></li>
						<li><a href="#audio-format" title="Go to Audio Forma">Audio Format</a></li>
					</ul>
					<li><a href="#formatting-section" title="Go to Formatting">Formatting</a></li>
					<ul>
						<li><a href="#ar-correction" title="Go to AR Correction">AR Correction</a></li>
						<li><a href="#background" title="Go to Background">Background</a></li>
						<li><a href="#box-overlay" title="Go to Box Overlay">Box Overlay</a></li>
					</ul>
					<li><a href="#source" title="Go to Source">Source</a></li>
					<ul>
						<li><a href="#source-name" title="Go to Source Name">Source Name</a></li>
						<li><a href="#add-source-to-beginning" title="Go to Add &quot;Source: &quot; to beginning">Add <q>Source: </q> to beginning</a></li>
						<li><a href="#place-source-at-top-of-video" title="Go to Place source at top of video">Place source at top of video</a></li>
					</ul>
					<li><a href="#position-fill-frame" title="Go to Position (Fill Frame)">Position (Fill Frame)</a></li>
					<li><a href="#position-transform" title="Go to Position (Transform)">Position (Transform)</a></li>
					<li><a href="#scale" title="Go to Scale">Scale</a></li>
					<li><a href="#crop" title="Go to Crop">Crop</a></li>
					<li><a href="#rotation" title="Go to Rotation">Rotation</a></li>
					<li><a href="#offset" title="Go to Offset">Offset</a></li>
					<ul>
						<li><a href="#rotate" title="Go to Rotate">Rotate</a></li>
						<li><a href="#reflect" title="Go to Reflect">Reflect</a></li>
					</ul>
					<li><a href="#setting-options" title="Go to Setting Options">Setting Options</a></li>
				</ul>
				<li><a href="#batch-naming" title="Go to Batch Naming">Batch Naming</a></li>
				<ul>
					<li><a href="#tokens" title="Go to Tokens">Tokens</a></li>
					<li><a href="#batch-name-options" title="Go to Batch Name Options">Batch Name Options</a></li>
				</ul>
				<li><a href="#save-locations" title="Go to Save Locations">Save Locations</a></li>
			</ul>
			<li><a href="#rendering" title="Go to Rendering">Rendering</a></li>
			<li><a href="#preferences" title="Go to Preferences">Preferences</a></li>
			<ul>
				<li><a href="#acquisition-settings" title="Go to Acquisition Settings">Acquisition Settings</a></li>
				<li><a href="#formatting-settings" title="Go to Formatting Settings">Formatting Settings</a></li>
				<li><a href="#warnings" title="Go to Warnings">Warnings</a></li>
				<li><a href="#output-options" title="Go to Output Options">Output Options</a></li>
				<ul>
					<li><a href="#output-resolution" title="Go to Output Resolution">Output Resolution</a></li>
					<li><a href="#output-frame-rate" title="Go to Output Frame Rate">Output Frame Rate</a></li>
					<li><a href="#auto-export-as-png" title="Go to Auto Export as .png">Auto Export as .png</a></li>
					<li><a href="#aspera-safe-characters" title="Go to Aspera Safe Characters">Aspera Safe Characters</a></li>
					<li><a href="#concurrent-renders" title="Go to Concurrent Renders">Concurrent Renders</a></li>
				</ul>
				<li><a href="#scratch-disks" title="Go to Scratch Disks">Scratch Disks</a></li>
				<li><a href="#save-locations-prefs" title="Go to Save Locations">Save Locations</a></li>
			</ul>
			<li><a href="#updating" title="Go to Updating">Updating</a></li>
		</ul>
	</nav>
)

export default TableOfContents
