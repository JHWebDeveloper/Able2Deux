import { updateMediaStateById } from 'actions'
import * as STATUS from 'status'

import {
  buildSource,
  cleanFilename,
  createPromiseQueue,
  getIntegerLength,
  replaceTokens,
  zeroize
} from 'utilities'

const updateRenderStatus = (id, renderStatus) => updateMediaStateById(id, { renderStatus })

const updateRenderProgress = ({ id, percent: renderPercent }) => updateMediaStateById(id, { renderPercent })

const renderQueue = createPromiseQueue()

const fillMissingFilenames = media => media.map(item => ({
	...item,
	filename: item.filename || 'Able2 Export $t $d'
}))

const createNamingTemplate = ({ type, replacer, prepend, append, separator = '' }) => {
	if (type === 'replace') {
		return filename => replacer.replace(/(?<!\\)\$f/g, filename)
	} else if (prepend && append) {
		return filename => [prepend, filename, append].join(separator)
	} else if (prepend) {
		return filename => [prepend, filename].join(separator)
	} else if (append) {
		return filename => [filename, append].join(separator)
	} else {
		return filename => filename
	}
}

const applyPresetName = separator => media => media.map(item => {
	if (!item.presetNamePrepend && !item.presetNameAppend) return item

	const presetNameTemplate = createNamingTemplate({
		prepend: item.presetNamePrepend,
		append: item.presetNameAppend,
		separator
	})

	return {
		...item,
		filename: presetNameTemplate(item.filename)
	}
})

const applyBatchName = ({ batchNameType, batchName, batchNamePrepend, batchNameAppend, batchNameSeparator }) => media => {
	if (
		media.length < 2 ||
		batchNameType === 'replace' && !batchName ||
		batchNameType === 'prepend_append' && !batchNamePrepend && !batchNameAppend
	) return media
	
	const batchNameTemplate = createNamingTemplate({
		type: batchNameType, 
		replacer: batchName,
		prepend: batchNamePrepend,
		append: batchNameAppend,
		separator: batchNameSeparator
	})

	return media.map(item => ({
		...item,
		filename: batchNameTemplate(item.filename)
	}))
}

const sanitizeFilenames = asperaSafe => media => media.map((item, i) => ({
	...item,
	filename: cleanFilename(replaceTokens(item.filename, i, media.length, item), asperaSafe)
}))

const replaceSpaces = (replace, replacement) => media => replace ? media.map(item => ({
  ...item,
  filename: item.filename.replaceAll(' ', replacement)
})) : media

const convertCase = (convert, casing) => media => {
  if (!convert) return media

  const converter = casing === 'uppercase' ? 'toUppercase' : 'toLowercase'

  return media.map(item => ({
    ...item,
    filename: item.filename[converter]()
  }))
}

const preventDuplicateFilenames = media => {
	if (media.length < 2) return media

	const tally = new Map()
	const { length } = media
	let i = 0

	do {
		const key = media[i].filename

		if (tally.has(key)) {
			tally.get(key).count++
			tally.get(key).total++
		} else {
			tally.set(key, { count: 1, total: 1 })
		}
	} while (++i < length)

	if (tally.size === length) return media

	const mediaCopy = [...media]

	while (i--) {
		const key = mediaCopy[i].filename
		const { count, total } = tally.get(key)

		if (total === 1) continue

		// make sure there are enough available characters to concatenate number count
		const totalLength = getIntegerLength(total)
		const maxFilenameLength = 246 - totalLength * 2

		if (key.length > maxFilenameLength) {
			mediaCopy[i].filename = key.slice(0, maxFilenameLength)
		}

		mediaCopy[i].filename = `${key} ${zeroize(count, totalLength)} of ${total}`

		tally.get(key).count--
	}

	return mediaCopy
}

const renderItem = (args, dispatch) => {
	const { saveLocations, renderOutput, renderFrameRate, customFrameRate, autoPNG } = args

	return async item => {
		const { id, arc, aspectRatio, sourceName, sourcePrefix, sourceOnTop, background } = item

		if (sourceName && !(arc === 'none' && aspectRatio !== '16:9')) {
			item.sourceData = buildSource({ sourceName, sourcePrefix, sourceOnTop, renderOutput, background })
		}
	
		try {
			await interop.requestRenderChannel({
				data: {
					...item,
					renderOutput,
					renderFrameRate,
					customFrameRate,
					autoPNG,
					saveLocations
				},
				startCallback() {
					dispatch(updateRenderStatus(id, STATUS.RENDERING))
				},
				progressCallback(data) {
					dispatch(updateRenderProgress(data))
				}
			})
	
			dispatch(updateRenderStatus(id, STATUS.COMPLETE))
		} catch (err) {
			const errStr = errorToString(err)

			if (errStr === 'CANCELLED') {
				dispatch(updateRenderStatus(id, STATUS.CANCELLED))
			} else {
				dispatch(updateRenderStatus(id, STATUS.FAILED))
				toastr.error(errStr, false, TOASTR_OPTIONS)
			}
		}
	}
}

export const render = args => async dispatch => {
	const { goBack, removeLocation } = args
	let { media, saveLocations } = args

	saveLocations = saveLocations.filter(({ hidden, checked }) => !hidden && checked)

	// Check for non-existent directories and prompt to abort render if found

	for await (const location of saveLocations) {
		const exists = await interop.checkIfDirectoryExists(location.directory)

		if (exists) continue

		dispatch(toggleSaveLocation(location.id))

		const { response, checkboxChecked } = await interop.directoryNotFoundAlert(location.directory)

		if (response > 0) return !goBack()

		if (checkboxChecked) removeLocation(location.id)

		saveLocations = saveLocations.filter(({ id }) => id !== location.id)
	}

	/*
		If save locations are selected or available, promote key directory to top level and remove duplicates.
		If not, prompt to choose a directory
	*/

	if (saveLocations.length) {
		saveLocations = [...new Set(saveLocations.map(({ directory }) => directory))]
	} else {
		const { filePaths, canceled } = await interop.chooseDirectory()

		if (canceled) return !goBack()

		saveLocations.push(filePaths[0])
	}

	// prepare filenames

	media = pipe(
		fillMissingFilenames,
		applyBatchName(args),
		applyPresetName(args.batchNameSeparator),
		sanitizeFilenames(args.asperaSafe),
    replaceSpaces(args.replaceSpaces, args.spaceReplacement),
    convertCase(args.conmvertCase, args.case),
		preventDuplicateFilenames
	)(media)

	for (const item of media) {
		dispatch(updateMediaStateById(item.id, {
			exportFilename: item.filename
		}))
	}

	// add to promise queue and begin render

	const renderItemReady = renderItem({
		saveLocations,
		renderOutput: args.renderOutput,
		renderFrameRate: args.renderFrameRate,
		customFrameRate: args.customFrameRate,
		autoPNG: args.autoPNG
	}, dispatch)

	for (const item of media) {
		renderQueue.add(item.id, () => renderItemReady(item))
	}

	renderQueue
		.updateConcurrent(args.concurrent)
		.start()
}

export const cancelRender = (id, renderStatus) => async dispatch => {
	if (renderStatus === STATUS.COMPLETE) return false

	if (renderStatus === STATUS.RENDERING) return interop.cancelRender(id)
	if (renderStatus === STATUS.PENDING) renderQueue.remove(id)

	dispatch(updateRenderStatus(id, STATUS.CANCELLED))
}
