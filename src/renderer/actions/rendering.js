import { toggleSaveLocation, updateMediaStateById } from 'actions'
import * as STATUS from 'status'

import {
  TOASTR_OPTIONS,
  buildSource,
  createPromiseQueue,
  errorToString,
  format12hr,
  framesToShortTC,
  getIntegerLength,
  pipe,
  zeroize,
  zeroizeAuto
} from 'utilities'

const { interop } = window.ABLE2

const updateRenderStatus = (id, renderStatus) => updateMediaStateById(id, { renderStatus })

const updateRenderProgress = ({ id, percent: renderPercent }) => updateMediaStateById(id, { renderPercent })

const renderQueue = createPromiseQueue()

// ---- FILL MISSING FILENAMES --------

const fillMissingFilenames = media => media.map(item => ({
	...item,
	filename: item.filename || 'Able2 Export $t $d'
}))

// ---- APPLY BATCH AND PRESET NAME TEMPLATES --------

const createNamingTemplate = ({ type, replacer, prepend, append, separator = '' }) => {
	if (type === 'replace') {
		return () => replacer
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

// ---- REPLACE FILENAME TOKENS --------

const getTokenReplacerFns = (i, l, { start, end, duration, fps, instances= [], versions = [], refId, id }) => {
	const d = new Date()

	return new Map(Object.entries({
		'$d': () => d.toDateString(),
		'$D': () => d.toLocaleDateString().replace(/\//g, '-'),
		'$t': () => format12hr(d),
		'$T': () => `${d.getHours()}${d.getMinutes()}`,
		'$i': () => zeroizeAuto(instances.indexOf(refId) + 1, instances.length),
		'$v': () => zeroizeAuto(versions.indexOf(id) + 1, versions.length),
		'$n': () => zeroizeAuto(i + 1, l),
		'$li': () => instances.length,
		'$lv': () => versions.length,
		'$l': () => l,
		'$s': () => framesToShortTC(start, fps),
		'$e': () => framesToShortTC(end, fps),
		'$r': () => framesToShortTC(duration * fps, fps),
		'$c': () => framesToShortTC(end - start, fps)
	}))
}

const removeEscapeChars = filename => filename.replace(/\\(?=\$(d|D|t|T|n|i|v|l(i|v)?|s|e|r|c))/g, '')

export const replaceTokens = (filename, i = 0, media) => {
	if (filename.length < 2) return filename

	const matches = [...new Set(filename.match(/(?<!\\)\$(d|D|t|T|n|i|v|l(i|v)?|s|e|r|c)/g))].sort().reverse()

	if (!media.length) return removeEscapeChars(filename)

	const item = media[i]

	if (matches.includes('$i') || matches.includes('$li')) {
		item.instances = [...new Set(media.map(({ refId }) => refId))]
	}

	if (matches.includes('$v') || matches.includes('$lv')) {
		item.versions = media.reduce((acc, { refId, id }) => {
			if (refId === item.refId) acc.push(id)
			return acc
		}, [])
	}

	const replacer = getTokenReplacerFns(i, media.length, item)
	
	for (const match of matches) {
		filename = filename.replace(new RegExp(`(?<!\\\\)\\${match}`, 'g'), replacer.get(match)())
	}

	return removeEscapeChars(filename)
}

const replaceFilenameTokens = media => media.map((item, i) => ({
  ...item,
  filename: replaceTokens(item.filename, i, media)
}))

// ---- CLEAN AND FORMAT FILENAME --------

const getAsperaSafeRegex = asperaSafe => new RegExp(`([%&"/:;<>?\\\\\`${asperaSafe ? '|ŒœŠšŸ​]|[^!-ż\\s' : ''}])`, 'g')

const sanitizeFilenames = asperaSafe => media => media.map(item => ({
	...item,
	filename: item.filename
    .replace(getAsperaSafeRegex(asperaSafe), '_')
    .trim()
    .slice(0, 252)
    .trimEnd()
}))

const replaceSpaces = (replace, replacement) => media => replace ? media.map(item => ({
  ...item,
  filename: item.filename.replaceAll(' ', replacement)
})) : media

const convertCase = (convert, casing) => media => {
  if (!convert) return media

  const converter = casing === 'uppercase' ? 'toUpperCase' : 'toLowerCase'

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

// ---- RENDER --------

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
    replaceFilenameTokens,
		sanitizeFilenames(args.asperaSafe),
    replaceSpaces(args.replaceSpaces, args.spaceReplacement),
    convertCase(args.convertCase, args.casing),
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
