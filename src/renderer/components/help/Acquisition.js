import React from 'react'

const { interop } = window.ABLE2

const Acquisition = () => (
	<section id="aquisition">
		<h2>Acquisition</h2>
		<p>Able2 has three ways of acquiring media.</p>
		<h3 id="downloading-from-a-url">Downloading from a URL</h3>
		<p>To download video or audio from an internet media service, copy and paste the URL where the media can be played into the text field labeled <q>Paste URL here</q> and click the Download button below it. The Download button will only be available when a valid URL is detected.</p>
		<p>To download from the web, Able2 makes use of youtube-dl, an open-source command line interface program that supports downloading from several online media services including but not limited to YouTube, Twitter, Facebook, Instagram, Vimeo, Twitch, TikTok, Reddit, Tumblr, Flickr, Dailymotion and SoundCloud.</p>
		<h4 id="optimization-options">Optimization Options</h4>
		<p>Some services, YouTube in particular, will omit the audio from higher quality versions of the video and play it in tandem with audio from a lower quality source. Able2 provides two options for obtaining these split media sources.</p>
		<table>
			<thead>
				<tr>
					<th>Option</th>
					<th>Description</th>
				</tr>
			</thead>
			<tbody>
				<tr>			
					<td>Optimize Video Quality</td>		
					<td>This option will download the highest quality video and audio sources seperately and merge them together if needed. This will take extra processing time.</td>
				</tr>
				<tr>
					<td>Optimize Download Time</td>
					<td>This option will download the highest quality video with audio already attached. This could potentially save some processing time.</td>
				</tr>
			</tbody>
		</table>
		<p>Optimization options will have no effect on services that do not split video and audio, or audio only services like SoundCloud.</p>
		<p>Unless the video is required in a timely fashion, Optimize Video Quality should always be set.</p>
		<h4 id="downloading-a-livestream">Downloading a Live Stream</h4>
		<p>Able2 has limited support for downloading live streams as they are streaming.</p>
		<p>To download from a supported live stream service, enter the URL as you would any normal download. When the media element appears in the Ready Queue, instead of the usual <i>close</i> button on the right, you will see a stop button <i>stop</i>. Clicking this button at any time will stop the live download.</p>
		<p>As stated live stream support is limited. YouTube and Twitch Livestreams work like any regular download. Other live stream services will likely not work with a simple website url, but if you are savvy with Chrome Developer Tools (or an equivalent feature in your browser of choice) and can locate the url for the stream&apos;s .m3u8 file, Able2 will likely be able to download from it.</p>
		<p>Currently Facebook Live is not compatible with Able2.</p>
		<h3 id="loading-files-from-your-device">Loading File(s) from your Device</h3>
		<p>In addition to downloading, Able2 offers several video processing options. To use these features on a media file already in your possession, drag and drop the file into area labeled <q>drag and drop file(s) here</q>. Alternatively, clicking on this area will display a file browser.</p>
		<p>Able2 has support for most video, image and audio files. You may drag and drop multiple files of mixed media types at the same time.</p>
		<h3 id="screen-recording">Screen Recording</h3>
		<p>Able2 has a built in screen recorder intended as a work around for when a URL or file is rejected.</p>
		<p>To start a screen record click the button labeled <q>start a screen record</q>.</p>
		<p>The button will transform into a popup window prompting you to select a record source. Able2 is able to record on your screen or isolate the recording to any open window on your device. If you are using a computer with multiple monitors, each monitor will be listed as a record source. If you&apos;re not prompted to select a record source, then you don&apos;t have any additional open windows or monitors. The recording has already started.</p>
		<p>Once a record source is selected, the button will blink red to indicate that Able2 is recording your screen. To stop recording, simply click the button again.</p>
		<p>It is recommended that you play your media in fullscreen if the option is available.</p>
		<p>Please note while Able2 can isolate the recording to a single open window, it will not isolate the audio to the window. The entire audio output of your device is recorded. Isolating the audio from a single window is not possible.</p>
		<h4 id="stop-timer">Stop Timer</h4>
		<p>The stop timer automatically stops the recording at a specified time. The timer can be found under the record button. It must switched on to take effect and accepts an HH:MM:SS timecode format. Default duration is one minute.</p>
		<p>Once the timer runs out the recording will stop and Able2 will be brought into focus.</p>
		<h4 id="screenshot-mode">Screenshot Mode</h4>
		<p>Alternatively you can take a still image of your screen instead of a video. Click the switch to the right of the record button so that the <i>camera_alt</i> icon is selected (The <i style={{ transform: 'rotate(90deg)' }}>local_movies</i> icon will be selected by default). Once screenshot is selected, click the record button and select a record source.</p>
		<p>Once a record source is selected, the Able2 window will disappear, take the screenshot and reappear. The screenshot will now be listed in the ready queue.</p>
		<p>The stop timer has no effect in screenshot mode and will be disabled.</p>
		{interop.isMac ?
			<>
				<h4 id="audio-support-for-mac">Audio Support for Mac</h4>
				<p>Due to limitations on Mac devices a free third-party program called Soundflower is required for recording device audio with video.</p>
				<ol>
					<li><a title="Get Soundflower" onClick={interop.getSoundflower}>Soundflower can be downloaded here</a>. Download the .dmg file.</li>
					<li>When the download is complete, open the .dmg file.</li>
					<li>A new finder window will appear. Ctrl+Click on the file titled <q>Soundflower.pkg</q> and choose <q>Open</q>.</li>
					<li>You may see a popup window alerting you that <q>macOS cannot verify the developer of Soundflower.pkg</q>. If so, click <q>Open</q>.</li>
					<li>Follow the onscreen instructions from the Soundflower installer.</li>
					<li>When the installation is complete open Audio Midi Setup. Audio Midi Setup can be found under /Applications/Utilities.</li>
					<li>Click the + button at the bottom left corner of the application and select <q>Create Multi-Output Device</q>.</li>
					<li>You will see a new Multi-Output device listed in the left column with a list of audio devices to the right. Check both <q>Built-in Output</q> and <q>Soundflower (2ch)</q>.</li>
					<li>You may now close Audio Midi Setup.</li>
				</ol>
				<h5 id="before-starting-a-screen-record">Before Starting a Screen Record</h5>
				<ol>
					<li>Open System Preferences and select <q>Sound</q>.</li>
					<li>Open the <q>Input</q> tab and select <q>Soundflower (2ch)</q>.</li>
					<li>You will now be able to record audio, but you won&apos;t able to hear it. Open the <q>Output</q> tab and select <q>Multi-Output Device</q>.</li>
					<li>You are now ready to record audio with video.</li>
					<li>When finished recording it is recommended that you set <q>Input</q> and <q>Output</q> back to their original settings as these changes may affect other applications.</li>
				</ol>
			</> : <></>
		}
		<h3 id="the-ready-queue">The Ready Queue</h3>
		<p>The Ready Queue is the area taking up the entire right side of the application. It lists all of the media files you have loaded into Able2.</p>
		<p>On the left side of each Media Element is a circular icon <i style={{ color: '#bbb' }}>lens</i> indicating the status of each Media Element. When the media is ready to format it will turn green <i style={{ color: '#0cf700' }}>lens</i>. Should there be an error loading the media or cancelled download it will turn red <i style={{ color: '#ff4800' }}>lens</i>. For all loading processes, the icon will be yellow <i style={{ color: '#fcdb03' }}>lens</i>.</p>
		<p>On the right side of each Media Element is a remove button labeled with an <i>close</i>. Click this button at any time to remove the media or cancel a current download. If you are downloading from a live stream, this button will temporarily be replaced with a stop button <i>stop</i>. Clicking the stop button will stop the live download.</p>
		<p>A progress bar will display for all downloads with an ETA in the upper right corner.</p>
		<p>You can clear the entire queue by clicking the Remove All button at the bottom.</p>
		<p>When all media has finished processing, you may click the Format button to move on to Able2&apos;s formatting phase. Any media elements that have failed on an error or been cancelled will be automatically removed.</p>
	</section>
)

export default Acquisition
