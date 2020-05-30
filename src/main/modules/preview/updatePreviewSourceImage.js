import path from 'path'
import ffmpeg from '../utilities/ffmpeg'
import { temp } from '../utilities/extFileHandlers'

const updatePreviewSourceImage = ({ id, mediaType, tempFilePath, tc = 0 }) => new Promise((resolve, reject) => {
	const command = ffmpeg(tempFilePath)
		.on('end', resolve)
		.on('error', reject)
		
	if (mediaType !== 'video') {
		const opts = ['-q:v 2']

		if (mediaType === 'gif') opts.push('-frames 1')

		command
			.outputOptions(opts)
			.output(path.join(temp.previews.path, `${id}.preview-source.jpg`))
			.run()
	} else {
		command.screenshot({
			timemarks: [`${tc}%`],
			folder: temp.previews.path,
			filename: `${id}.preview-source.jpg`
		})
	}
})

export default updatePreviewSourceImage
