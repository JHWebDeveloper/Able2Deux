import { updateMediaStateById } from 'actions'
import toastr from 'toastr'

import { ACTION, STATUS, TOASTR_OPTIONS } from 'constants'

import {
	buildSource,
	errorToString,
	format12hr,
	framesToShortTC,
	getIntegerLength,
	pipe,
	zeroize,
	zeroizeAuto
} from 'utilities'

const { interop } = window.ABLE2

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

const applyBatchName = ({ batchNameType, batchName, batchNamePrepend, batchNameAppend }, batchNameSeparator) => media => {
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

const getTokenReplacerFns = (index, length, dateTimeSource, media) => {
	const { start, end, duration, fps, instances = [], versions = [], refId, id } = media
	const date = media?.[dateTimeSource] ?? new Date()

	return new Map(Object.entries({
		'$d': () => date.toDateString(),
		'$D': () => date.toLocaleDateString().replace(/\//g, '-'),
		'$t': () => format12hr(date),
		'$T': () => `${date.getHours()}${date.getMinutes()}`,
		'$i': () => zeroizeAuto(instances.indexOf(refId) + 1, instances.length),
		'$v': () => zeroizeAuto(versions.indexOf(id) + 1, versions.length),
		'$n': () => zeroizeAuto(index + 1, length),
		'$li': () => instances.length,
		'$lv': () => versions.length,
		'$l': () => length,
		'$s': () => framesToShortTC(start, fps),
		'$e': () => framesToShortTC(end, fps),
		'$r': () => framesToShortTC(duration * fps, fps),
		'$c': () => framesToShortTC(end - start, fps)
	}))
}

const removeEscapeChars = filename => filename.replace(/\\(?=\$(d|D|t|T|n|i|v|l(i|v)?|s|e|r|c))/g, '')

export const replaceTokens = (filename, index = 0, dateTimeSource, media) => {
	if (filename.length < 2) return filename

	const matches = [...new Set(filename.match(/(?<!\\)\$(d|D|t|T|n|i|v|l(i|v)?|s|e|r|c)/g))].sort().reverse()

	if (!media.length) return removeEscapeChars(filename)

	const item = media[index]

	if (matches.includes('$i') || matches.includes('$li')) {
		item.instances = [...new Set(media.map(({ refId }) => refId))]
	}

	if (matches.includes('$v') || matches.includes('$lv')) {
		item.versions = media.reduce((acc, { refId, id }) => {
			if (refId === item.refId) acc.push(id)
			return acc
		}, [])
	}

	const replacer = getTokenReplacerFns(index, media.length, dateTimeSource, item)
	
	for (const match of matches) {
		filename = filename.replace(new RegExp(`(?<!\\\\)\\${match}`, 'g'), replacer.get(match)())
	}

	return removeEscapeChars(filename)
}

const replaceFilenameTokens = dateTimeSource => media => media.map((item, i) => ({
	...item,
	filename: replaceTokens(item.filename, i, dateTimeSource, media)
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

const replaceFilenameSpaces = (replace, replacement) => media => replace ? media.map(item => ({
	...item,
	filename: item.filename.replaceAll(' ', replacement)
})) : media

const convertFilenameCase = (convert, casing) => media => {
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

const addRenderProps = media => media.map(item => ({
	...item,
	renderStatus: STATUS.PENDING,
	renderPercent: 0,
	exportPaths: []
}))

export const prepareMediaForRender = ({
	asperaSafe,
	batchName,
	batchNameSeparator,
	casing,
	convertCase,
	dateTimeSource,
	directories,
	media,
	replaceSpaces,
	spaceReplacement
}) => ({
	type: ACTION.UPDATE_STATE,
	payload: {
		media: pipe(
			fillMissingFilenames,
			applyBatchName(batchName, batchNameSeparator),
			applyPresetName(batchNameSeparator),
			replaceFilenameTokens(dateTimeSource),
			sanitizeFilenames(asperaSafe),
			replaceFilenameSpaces(replaceSpaces, spaceReplacement),
			convertFilenameCase(convertCase, casing),
			preventDuplicateFilenames,
			addRenderProps
		)(media),
		directories,
		mediaLoaded: true
	}
})

const updateRenderStatus = (id, renderStatus) => updateMediaStateById(id, { renderStatus })

const updateRenderProgress = ({ id, percent: renderPercent }) => updateMediaStateById(id, { renderPercent })

export const createRenderAction = ({
	autoPNG,
	customFrameRate,
	directories,
	renderFrameRate,
	renderOutput
}) => item => async dispatch => {
	const { id, arc, aspectRatio, sourceName, sourcePrefix, sourceOnTop, background } = item

	if (sourceName && !(arc === 'none' && aspectRatio !== '16:9')) {
		item.sourceData = buildSource({ sourceName, sourcePrefix, sourceOnTop, renderOutput, background })
	}

	try {
		const exportPaths = await interop.requestRenderChannel({
			data: {
				...item,
				autoPNG,
				customFrameRate,
				renderFrameRate,
				renderOutput,
				directories
			},
			startCallback() {
				dispatch(updateRenderStatus(id, STATUS.RENDERING))
			},
			progressCallback(data) {
				dispatch(updateRenderProgress(data))
			}
		})

		dispatch(updateMediaStateById(id, {
			renderStatus: STATUS.COMPLETE,
			exportPaths
		}))
	} catch (err) {
		const errStr = errorToString(err)

		if (errStr === STATUS.CANCELLED) {
			dispatch(updateRenderStatus(id, STATUS.CANCELLED))
		} else {
			dispatch(updateRenderStatus(id, STATUS.FAILED))
			toastr.error(errStr, false, TOASTR_OPTIONS)
		}
	}
}

export const createCancelRenderAction = promiseQueue => (id, renderStatus) => dispatch => {
	if (renderStatus !== STATUS.RENDERING && renderStatus !== STATUS.PENDING) return false
	if (renderStatus === STATUS.RENDERING) return interop.cancelRender(id)
	if (renderStatus === STATUS.PENDING) promiseQueue.remove(id)

	dispatch(updateRenderStatus(id, STATUS.CANCELLED))
}
