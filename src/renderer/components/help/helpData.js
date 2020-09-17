import React from 'react'
import { renderToString } from 'react-dom/server'

const { interop } = window.ABLE2

const SECTION = 'section'
const TABLE = 'table'
const LIST = 'list'

export default [
	{
		type: SECTION,
		title: 'Acquisition',
		content: [
			'Able2 has three ways of acquiring media.',
			{
				type: SECTION,
				title: 'Downloading from a URL',
				content: [
					'To download video or audio from an internet media service, copy and paste the URL where the media can be played into the text field labeled <q>Paste URL here</q> and click the Download button below it. The Download button will only be available when a valid URL is detected.',
					'To download from the web, Able2 makes use of youtube-dl, an open-source command line interface program that supports downloading from several online media services including but not limited to YouTube, Twitter, Facebook, Instagram, Vimeo, Twitch, TikTok, Reddit, Tumblr, Flickr, Dailymotion and SoundCloud.',
					{
						type: SECTION,
						title: 'Optimization Options',
						content: [
							'Some services, YouTube in particular, will omit the audio from higher quality versions of the video and play it in tandem with audio from a lower quality source. Able2 provides two options for obtaining these split media sources.',
							{
								type: TABLE,
								title: ['Option', 'Description'],
								content: [
									[
										'Optimize Video Quality',
										'This option will download the highest quality video and audio sources seperately and merge them together if needed. This will take extra processing time.'
									],
									[
										'Optimize Download Time',
										'This option will download the highest quality video with audio already attached. This could potentially save some processing time.'
									]
								]
							},
							'Optimization options will have no effect on services that do not split video and audio, or audio only services like SoundCloud.',
							'Unless the video is required in a timely fashion, Optimize Video Quality should always be set.'
						]
					},
					{
						type: SECTION,
						title: 'Downloading a Live Stream',
						content: [
							'Able2 has limited support for downloading live streams as they are streaming.',
							'To download from a supported live stream service, enter the URL as you would any normal download. When the media element appears in the Ready Queue, instead of the usual remove button on the right, you will see a stop button. Clicking this button at any time will stop the live download.',
							'As stated live stream support is limited. YouTube and Twitch Livestreams work like any regular download. Other live stream services will likely not work with a simple website url, but if you are savy with Chrome Developer Tools (or an equivalent feature in your browser of choice) and can locate the url for the stream\'s .m3u8 file, Able2 will likely be able to download from it.',
							'Currently Facebook Live is not compatible with Able2.'
						]
					},
				]
			},
			{
				type: SECTION,
				title: 'Loading File(s) from your Device',
				content: [
					'In addition to downloading, Able2 offers several video processing options. To use these features on a media file already in your posession, drag and drop the file into area labeled <q>drag and drop file(s) here</q>. Alternatively, clicking on this area will display a file browser.',
					'Able2 has support for most video, image and audio files. You may drag and drop multiple files of mixed media types at the same time.'
				]
			},
			{
				type: SECTION,
				title: 'Screen Recording',
				content: [
					'To start a screen record click the button labeled <q>start a screen record</q>.',
					'The button will transform into a popup window prompting you to select a record source. Able2 is able to record on your screen or isolate the recording to any open window on your device. If you are using a computer with multiple monitors, each monitor will be listed as a record source. If you\'re not prompted to select a record source, then you dont have any additional open windows or monitors. The recording has already started.',
					'Once a record source is selected, the button will blink red to indicate that Able2 is recording your screen. To stop recording, simply click the button again.',
					'It is recommended that you play your media in fullscreen if the option is available.',
					'Please note while Able2 can isolate the recording to a single open window, it will not isolate the audio to the window. The entire audio output of your device is recorded. Isolating the audio from a single window is not possible.',
					{
						type: SECTION,
						title: 'Stop Timer',
						content: [
							'The stop timer automatically stops the recording at a specified time. The timer can be found under the record button. It must switched on to take effect and accepts an HH:MM:SS timecode format. Default duration is one minute.',
							'Once the timer runs out the recording will stop and Able2 will be brought into focus.'
						]
					},
					{
						type: SECTION,
						title: 'Screenshot Mode',
						content: [
							`Alternatively you can take a still image of your screen instead of a video. Click the switch to the right of the record button so that the <i>camera_alt</i> icon is selected (The ${renderToString(<i style={{ transform: 'rotate(90deg)' }}>local_movies</i>)} icon will be selected by default). Once screenshot is selected, click the record button and select a record source.`,
							'Once a record source is selected, the Able2 window will disappear, take the screenshot and reappear. The screenshot will now be listed in the ready queue.',
							'The stop timer has no effect in screenshot mode and will be disabled.'
						]
					},
					{
						type: SECTION,
						hide: !interop.isMac,
						content: [
							'Due to limitations on Mac devices a free third-party program called Soundflower is required for recording device audio with video.',
							{
								type: LIST,
								content: [
									`<a title="Get Soundflower" onClick="interop.getSoundflower">Soundflower can be downloaded here</a>. Download the .dmg file.`,
									'When the download is complete, open the .dmg file.',
									'A new finder window will appear. Ctrl+Click on the file titled &quot;Soundflower.pkg&quot; and choose &quot;Open&quot;.',
									'You may see a popup window alerting you that &quot;macOS cannot verify the developer of Soundflower.pkg&quot;. If so, click &quot;Open&quot;.',
									'Follow the onscreen instructions from the Soundflower installer.',
									'When the installation is complete open Audio Midi Setup. Audio Midi Setup can be found under /Applications/Utilities.',
									'Click the + button at the bottom left corner of the application and select &quot;Create Multi-Ouput Device&quot;.',
									'You will see a new Multi-Output device listed in the left column with a list of audio devices to the right. Check both &quot;Built-in Output&quot; and &quot;Soundflower (2ch)&quot;.',
									'You may now close Audio Midi Setup.'
								]
							}
						]
					}
				]
			}
		]
	}
]